"""Focused authored assembly. Curie device is an interpretation of a referenced
quadrant electrometer, not a scan/reproduction. Other room stations are untouched.
"""
import bpy,math
from pathlib import Path

def build(api):
 box,lathe,model,material,at,objects,source=(api[k] for k in ['box','lathe','model','material','at','objects','SOURCE'])
 wood,brass,ebonite,paper=(api[k] for k in ['wood','brass','ebonite','paper'])
 folder=source/'main-table'
 def textured(name,color_file,rough_file,metallic):
  m=material(name,(.5,.5,.5),metallic,.35);nodes=m.node_tree.nodes;links=m.node_tree.links;p=nodes.get('Principled BSDF');uv=nodes.new('ShaderNodeUVMap');uv.uv_map='UVMap'
  for filename,socket,space in [(color_file,'Base Color','sRGB'),(rough_file,'Roughness','Non-Color')]:
   if not filename:continue
   n=nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(folder/filename),check_existing=True);n.image.colorspace_settings.name=space;links.new(uv.outputs['UV'],n.inputs['Vector']);links.new(n.outputs['Color'],p.inputs[socket])
  if metallic:
   n=nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(folder/'metal-normal.png'));n.image.colorspace_settings.name='Non-Color';bump=nodes.new('ShaderNodeNormalMap');bump.inputs['Strength'].default_value=.35;links.new(uv.outputs[0],n.inputs['Vector']);links.new(n.outputs[0],bump.inputs['Color']);links.new(bump.outputs[0],p.inputs['Normal'])
  return m
 metal=textured('Main_aged_brass','brass-color.jpg','brass-rough.jpg',.82)
 clear=textured('Main_optical_glass',None,'glass-rough.jpg',0);p=clear.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.86,.93,.90,1);p.inputs['Transmission Weight'].default_value=.94;p.inputs['IOR'].default_value=1.47
 # A licensed farmhouse worktable with real wear, aprons and carpentry.
 table=model('painted_wooden_table','Main_research_table',(0,-1.65,-2.2),dimensions=(3.2,1.13,1.0),rotation=.012)
 bevel=table.modifiers.new('Softened_workbench_edges','BEVEL');bevel.width=.004;bevel.segments=2;bpy.context.view_layer.objects.active=table;bpy.ops.object.modifier_apply(modifier=bevel.name)
 top=-.50
 # Authored cylinder with rolled edges and continuous UVs; contours are in meters.
 def turned(name,profile,pos,mat,segments=48):
  o=lathe(name,profile,pos,mat,segments)
  uv=o.data.uv_layers['UVMap'];min_h=min(p[0] for p in profile);height=max(p[0] for p in profile)-min_h
  for poly in o.data.polygons:
   angles=[]
   for li in poly.loop_indices:
    co=o.data.vertices[o.data.loops[li].vertex_index].co;angles.append(math.atan2(co.y,co.x)/math.tau%1)
   seam=max(angles)-min(angles)>.5
   for li,u in zip(poly.loop_indices,angles):
    co=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(u+1 if seam and u<.5 else u,(co.z-min_h)/max(.001,height))
  return o
 # Open cage, suspended quadrants and mast: educational interpretation of the
 # Wellcome photograph M0011486. The separate dial is explicitly a simulation.
 x,z=-.91,-2.16
 turned('Main_electrometer_foot',[(0,.18),(.012,.205),(.026,.205),(.037,.18),(.05,.18)],(x,top,z),metal)
 turned('Main_electrometer_lower_bead',[(0,.168),(.01,.178),(.025,.178),(.036,.165)],(x,top+.05,z),metal)
 turned('Main_electrometer_cover',[(0,.17),(.012,.183),(.03,.183),(.044,.16)],(x,top+.32,z),metal)
 # Thin structural guard supports preserve sight into the instrument.
 for i in range(12):
  a=i*math.tau/12;turned('Main_cage_rib',[(0,.0025),(.255,.0025)],(x+math.cos(a)*.163,top+.078,z+math.sin(a)*.163),metal,8)
 for h in [.11,.19,.28]:
  turned('Main_guard_ring',[(0,.164),(.002,.164),(.002,.161),(0,.161)],(x,top+h,z),metal)
 turned('Main_suspended_plates',[(0,.105),(.014,.105),(.017,.06),(.05,.06)],(x,top+.19,z),metal)
 turned('Main_insulator',[(0,.045),(.025,.05),(.043,.047)],(x,top+.36,z),ebonite)
 turned('Main_electrometer_mast',[(0,.012),(.34,.012),(.352,.019),(.362,.019)],(x,top+.40,z),metal,24)
 turned('Main_terminal_cap',[(0,.027),(.012,.027),(.02,.022)],(x,top+.765,z),ebonite,24)
 for dx,dz in [(-.12,.03),(.11,-.04)]:turned('Main_knurled_terminal',[(0,.014),(.025,.014),(.028,.022),(.039,.022)],(x+dx,top+.36,z+dz),metal,20)
 # Reader housing with bezel, screw heads, feet and texture-engraved dial.
 box('Main_reader_housing',(.30,.23,.16),(-.61,top+.15,-1.95),ebonite,.018)
 box('Main_reader_bezel',(.275,.205,.009),(-.61,top+.15,-1.864),metal,.012)
 dial=textured('Main_simulated_dial','dial-face.jpg',None,0)
 face=box('Main_reader_face',(.248,.174,.004),(-.61,top+.15,-1.857),dial,.006)
 for loop in face.data.loops:
  co=face.data.vertices[loop.vertex_index].co;face.data.uv_layers['UVMap'].data[loop.index].uv=(co.x/.248+.5,co.z/.174+.5)
 for dx in [-.128,.128]:
  for dy in [-.095,.095]:
   screw=turned('Main_reader_screw',[(0,.008),(.004,.008)],(-.61+dx,top+.15+dy,-1.852),metal,12);screw.rotation_mode='XYZ';screw.rotation_euler.x=math.pi/2
 # The original detailed optical model stays at real-world scale.
 model('vintage_microscope','Main_brass_microscope',(.58,top,-2.36),height=.48,rotation=-.95)
 model('vintage_oil_lamp','Main_oil_lamp',(1.22,top,-2.40),height=.48,rotation=.23)
 # Small mineral tray; its label does not claim that this is pure polonium.
 tray=box('Main_specimen_tray',(.36,.025,.27),(.97,top+.015,-1.99),wood,.012);tray.rotation_euler.z=-.13
 model('stone_01','Main_educational_mineral',(.97,top+.036,-1.99),height=.13,rotation=.5,decimate=.14)
 # Continuous glass shells with a wall thickness and rolled lips; no joined balls.
 for i,(px,pz,h,r) in enumerate([(-.12,-2.36,.29,.085),(.15,-2.30,.22,.06),(-.29,-2.03,.19,.048)]):
  profile=[(0,r*.7),(.008,r),(.02,r),(h*.22,r),(h*.68,r*.3),(h-.015,r*.30),(h-.015,r*.38),(h,r*.38),(h,r*.26),(h-.02,r*.24),(h*.68,r*.24),(h*.22,r-.002),(.01,r-.002)]
  turned('Main_research_flask',profile,(px,top,pz),clear,48)
  if i==1:turned('Main_glass_stopper',[(0,r*.23),(.018,r*.25),(.025,r*.35),(.042,r*.35)],(px,top+h,pz),clear,24)
 magnifier=model('magnifying_glass_01','Main_magnifier',(.28,top+.025,-2.1),height=.28,rotation=-.4);magnifier.rotation_euler.x=math.pi/2
 # Existing educational notes material is attached later by the room builder.
 for i in range(3):
  page=box('Working_paper',(.25,.002,.32),(.16+i*.085,top+.004+i*.002,-2.02+i*.012),paper,.001);page.rotation_euler.z=-.12+i*.04
 return {'readerPivot':[-.61,top+.15-.045,-1.851], 'tableCenter':[0,-.52,-2.2], 'minimumFrontDistance':1.65, 'historicalModel':'Authored interpretation, not a scan of the original'}
