"""Run with Blender 4.5 LTS -b --python scripts/build-curie-scene.py.
Creates a 1940s-inspired communications room with CC0 props and a real
Cycles irradiance bake. No scene navigation, sensor, or gaze code lives here.
"""
import bpy, math, random, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'.runtime/art-source'
OUT=ROOT/'public/assets/hedy-lamarr';OUT.mkdir(parents=True,exist_ok=True)
random.seed(1942)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.cycles.max_bounces=6;scene.cycles.diffuse_bounces=4;scene.cycles.glossy_bounces=3;scene.cycles.transmission_bounces=4
scene.world.color=(.12,.12,.12)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.48,.56,.65,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.014
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0
floor=-1.65
objects=[]
def at(v):return Vector((v[0],-v[2],v[1]))
def material(name,color,metal=0,rough=.7):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
wood=None
plaster=None
def pbr(name,asset):
 m=material(name,(.5,.5,.5));n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF');uv=n.new('ShaderNodeUVMap');uv.uv_map='UVMap'
 for kind in ['diff','rough','nor_gl']:
  image=bpy.data.images.load(str(SOURCE/'textures'/asset/(kind+'.jpg')),check_existing=True)
  if kind!='diff':image.colorspace_settings.name='Non-Color'
  t=n.new('ShaderNodeTexImage');t.image=image;l.new(uv.outputs['UV'],t.inputs['Vector'])
  if kind=='diff':l.new(t.outputs['Color'],p.inputs['Base Color'])
  elif kind=='rough':l.new(t.outputs['Color'],p.inputs['Roughness'])
  else:
   normal=n.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.65;l.new(t.outputs['Color'],normal.inputs['Color']);l.new(normal.outputs['Normal'],p.inputs['Normal'])
 return m
wood=pbr('Aged_oak', 'old_wood_floor');plaster=pbr('Stained_lime_plaster','grey_plaster_03');iron=pbr('Oxidised_iron','rusty_metal')
brass=material('Patinated_brass',(.30,.20,.085),.78,.38)
ebonite=material('Black_ebonite',(.023,.019,.014),.18,.43)
paper=material('Ivory_paper',(.63,.53,.36),0,.95)
leather=material('Leather_spine',(.07,.028,.015),0,.75)
glass=material('Old_glass',(.24,.31,.26),.06,.17)
glass.node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value=.55
glass.node_tree.nodes['Principled BSDF'].inputs['IOR'].default_value=1.47
# Gentle real material microdetail, preserved in PBR normal maps for imported models.
def projected_uv(obj,scale=.5):
 uv=obj.data.uv_layers.get('UVMap') or obj.data.uv_layers.new(name='UVMap')
 for poly in obj.data.polygons:
  n=poly.normal;dominant=max(range(3),key=lambda a:abs(n[a]))
  for loop in poly.loop_indices:
   co=obj.data.vertices[obj.data.loops[loop].vertex_index].co
   a,b=([1,2] if dominant==0 else [0,2] if dominant==1 else [0,1]);uv.data[loop].uv=(co[a]*scale,co[b]*scale)
 return obj

def box(name,size,pos,mat,bevel=.015):
 bpy.ops.mesh.primitive_cube_add(size=1,location=at(pos));o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat);projected_uv(o)
 if bevel:
  mod=o.modifiers.new('Worn_edges','BEVEL');mod.width=bevel;mod.segments=2;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 if mat==plaster:
  projected_uv(o,.22)
 objects.append(o);return o

def lathe(name,profile,pos,mat,segments=40):
 verts=[];faces=[]
 for height,radius in profile:
  for s in range(segments):
   a=s/segments*math.tau;verts.append((math.cos(a)*radius,math.sin(a)*radius,height))
 for j in range(len(profile)-1):
  for s in range(segments):faces.append((j*segments+s,j*segments+(s+1)%segments,(j+1)*segments+(s+1)%segments,(j+1)*segments+s))
 faces.append(tuple(reversed(range(segments))));faces.append(tuple((len(profile)-1)*segments+s for s in range(segments)))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.location=at(pos);o.data.materials.append(mat);projected_uv(o,3)
 for p in mesh.polygons:p.use_smooth=True
 objects.append(o);return o

model_cache={}
def model(asset,name,pos,dimensions=None,height=None,rotation=0,decimate=1):
 if asset not in model_cache:
  before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(SOURCE/'models'/asset/(asset+'.gltf')))
  imported=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
  bpy.ops.object.select_all(action='DESELECT')
  for o in imported:o.select_set(True)
  bpy.context.view_layer.objects.active=imported[0];bpy.ops.object.join();o=imported[0]
  bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
  # Baked vertices in local meters; imported root transforms no longer needed.
  matrix=o.matrix_world.copy()
  for v in o.data.vertices:v.co=matrix@v.co
  o.parent=None;o.matrix_world.identity()
  lo=Vector(tuple(min(v.co[i] for v in o.data.vertices) for i in range(3)));hi=Vector(tuple(max(v.co[i] for v in o.data.vertices) for i in range(3)))
  center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
  for v in o.data.vertices:v.co-=center
  if decimate<1:
   mod=o.modifiers.new('Mobile_LOD','DECIMATE');mod.ratio=decimate;bpy.ops.object.modifier_apply(modifier=mod.name)
  if o.data.uv_layers:o.data.uv_layers[0].name='UVMap'
  # Explicit UV nodes keep original PBR mapping independent of bake UVs.
  for mat in o.data.materials:
   if mat and mat.use_nodes:
    uv=mat.node_tree.nodes.new('ShaderNodeUVMap');uv.uv_map='UVMap'
    for node in mat.node_tree.nodes:
     if node.type=='TEX_IMAGE':mat.node_tree.links.new(uv.outputs['UV'],node.inputs['Vector'])
  model_cache[asset]=o
 else:
  original=model_cache[asset];o=original.copy();o.data=original.data.copy();scene.collection.objects.link(o)
  # Cache stores already-sized first object: normalize again from its geometry.
 o.name=name
 bounds=[Vector(v.co) for v in o.data.vertices];lo=Vector(tuple(min(v[i] for v in bounds) for i in range(3)));hi=Vector(tuple(max(v[i] for v in bounds) for i in range(3)));extent=hi-lo
 if dimensions:factor=Vector((dimensions[0]/extent.x,dimensions[2]/extent.y,dimensions[1]/extent.z))
 elif height:factor=Vector((height/extent.z,)*3)
 else:factor=Vector((1,1,1))
 for v in o.data.vertices:v.co=Vector((v.co.x*factor.x,v.co.y*factor.y,v.co.z*factor.z))
 o.location=at(pos);o.rotation_mode='XYZ';o.rotation_euler=(0,0,rotation);o.scale=(1,1,1);objects.append(o)
 print('PLACED',name,len(o.data.polygons),flush=True);return o

# Stage 1: closed room, benches and primary apparatus. Stage 2 below adds fittings.
H=ROOT/'.runtime/hedy-source'
def image_mat(name,path,metallic=0,rough=.75,emission=0):
 m=material(name,(.5,.5,.5),metallic,rough);n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF');t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(path),check_existing=True);uv=n.new('ShaderNodeUVMap');uv.uv_map='UVMap';l.new(uv.outputs[0],t.inputs['Vector']);l.new(t.outputs[0],p.inputs['Base Color'])
 if emission:l.new(t.outputs[0],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=emission
 return m
paint=image_mat('Hedy_crackle_enamel',H/'enamel-color.jpg',.25,.65)
for filename,socket in [('enamel-rough.jpg','Roughness'),('enamel-normal.png','Normal')]:
 n=paint.node_tree.nodes;t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(H/filename));t.image.colorspace_settings.name='Non-Color';uv=n.new('ShaderNodeUVMap');uv.uv_map='UVMap';paint.node_tree.links.new(uv.outputs[0],t.inputs['Vector'])
 if socket=='Normal':b=n.new('ShaderNodeNormalMap');b.inputs['Strength'].default_value=.35;paint.node_tree.links.new(t.outputs[0],b.inputs['Color']);paint.node_tree.links.new(b.outputs[0],n.get('Principled BSDF').inputs[socket])
 else:paint.node_tree.links.new(t.outputs[0],n.get('Principled BSDF').inputs[socket])
steel=image_mat('Hedy_brushed_steel',H/'steel.jpg',.72,.44)
bakelite=material('Hedy_bakelite',(.019,.023,.019),.05,.38)
wallsteel=material('Hedy_wall_steel',(.075,.12,.115),.32,.78)
paper=material('Hedy_paper',(.60,.50,.31),0,.9)
warm=material('Hedy_amber_glass',(.7,.37,.1),0,.45);p=warm.node_tree.nodes['Principled BSDF'];p.inputs['Emission Color'].default_value=(1,.56,.20,1);p.inputs['Emission Strength'].default_value=2.2
green=material('Hedy_green_pilot',(.08,.25,.075),0,.3);p=green.node_tree.nodes['Principled BSDF'];p.inputs['Emission Color'].default_value=(.15,.65,.18,1);p.inputs['Emission Strength'].default_value=.9
red=material('Hedy_red_pilot',(.35,.03,.015),0,.3);p=red.node_tree.nodes['Principled BSDF'];p.inputs['Emission Color'].default_value=(.8,.05,.025,1);p.inputs['Emission Strength'].default_value=.65
wood=pbr('Hedy_aged_oak','old_wood_floor')
# Flush flat artwork with explicit UVs, avoiding projected repeating patterns.
def picture(name,size,pos,mat,axis='front',tile=None):
 o=box(name,(size[0],size[1],.008),pos,mat,.002)
 for loop in o.data.loops:
  co=o.data.vertices[loop.vertex_index].co;u=co.x/size[0]+.5;v=co.z/size[1]+.5
  if tile is not None:u=(tile%3+u)/3;v=(1-math.floor(tile/3))/2+v/2
  o.data.uv_layers['UVMap'].data[loop.index].uv=(u,v)
 if axis=='rear':o.rotation_euler.z=math.pi
 if axis=='right':o.rotation_euler.z=-math.pi/2
 if axis=='left':o.rotation_euler.z=math.pi/2
 return o

def cylinder(name,radius,depth,pos,mat,front=False,segments=32):
 o=lathe(name,[(0,radius),(.002,radius*1.025),(depth-.002,radius*1.025),(depth,radius)],pos,mat,segments)
 if front:o.rotation_euler.x=math.pi/2
 return o

def wire(name,points,radius=.008,mat=None):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=6;cu.bevel_depth=radius;cu.bevel_resolution=2;sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for p,co in zip(sp.bezier_points,points):p.co=at(co);p.handle_left_type=p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,cu);scene.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o=bpy.context.object;o.data.materials.append(mat or bakelite);projected_uv(o,2);objects.append(o);o.select_set(False);return o

def screw(pos,front=True):
 cylinder('Steel_fastener',.007,.008,pos,steel,front,12)
 # Engraved screw head slot in dark inlay.
 box('Fastener_slot',(.009,.0015,.001),(pos[0],pos[1],pos[2]+.009),bakelite,.0005)

def knob(x,y,z,r=.05):
 cylinder('Bakelite_stepped_knob',r,.035,(x,y,z),bakelite,True,32);cylinder('Knob_metal_hub',r*.31,.006,(x,y,z+.035),steel,True,24)
 for i in range(14):
  a=i/14*math.tau;box('Knurled_grip',(.003,.009,.026),(x+math.cos(a)*r,y+math.sin(a)*r,z+.019),bakelite,.001)
 box('Ivory_knob_mark',(.003,r*.32,.002),(x,y+r*.55,z+.039),paper,.001)

def disk_picture(name,r,pos,mat):
 vertices=[(0,0,0)]+[(math.cos(i/64*math.tau)*r,0,math.sin(i/64*math.tau)*r)for i in range(64)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],[(0,i+1,(i+1)%64+1)for i in range(64)]);mesh.update()
 o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.location=at(pos);mesh.materials.append(mat);uv=mesh.uv_layers.new(name='UVMap')
 for loop in mesh.loops:
  co=mesh.vertices[loop.vertex_index].co;uv.data[loop.index].uv=(co.x/(r*2)+.5,co.z/(r*2)+.5)
 objects.append(o);return o

def gauge(x,y,z,r=.11):
 cylinder('Gauge_bezel',r,.025,(x,y,z),steel,True,48)
 mat=gauge_mat
 o=disk_picture('Printed_analog_gauge',r*.91,(x,y,z+.027),mat)
 # The round bezel hides square corners; mapped circle has an aged ivory surround.

box('Wooden_plank_floor',(6.4,.14,6.8),(0,floor-.07,0),wood,.003)
box('Acoustic_dark_ceiling',(6.4,.13,6.8),(0,1.95,0),wallsteel,.01)
for z in [-3.4,3.4]:
 box('Lower_oak_wall',(6.4,1.85,.12),(0,-.72,z),wood,.005)
 box('Upper_steel_wall',(6.4,1.9,.12),(0,1.12,z),wallsteel,.008)
 for x in [-3,-2,-1,0,1,2,3]:box('Wall_panel_batten',(.035,3.4,.045),(x,.05,z-math.copysign(.075,z)),steel,.004)
for x in [-3.2,3.2]:
 box('Oak_side_wall',(.12,1.85,6.8),(x,-.72,0),wood,.005);box('Metal_side_wall',(.12,1.9,6.8),(x,1.12,0),wallsteel,.008)
 for z in [-3,-2,-1,0,1,2,3]:box('Side_wall_batten',(.045,3.4,.035),(x-math.copysign(.075,x),.05,z),steel,.004)
for z in [-3.28,3.28]:box('Oak_skirting',(6.2,.16,.06),(0,floor+.08,z),wood,.008)
for x in [-3.08,3.08]:box('Side_skirting',(.06,.16,6.4),(x,floor+.08,0),wood,.008)
model('wooden_table_02','Front_radio_workbench',(0,floor,-2.4),dimensions=(2.9,1.06,.95))
model('wooden_table_02','Frequency_workbench',(-2.25,floor,.2),dimensions=(2.6,1.06,.86),rotation=math.pi/2)
model('wooden_table_02','Chart_workbench',(2.25,floor,.35),dimensions=(2.6,1.06,.86),rotation=math.pi/2)
# Heavy framed rack with actual inset shelves, feet, vents, handles and faceplates.
for x in [-2.38,2.38]:
 box('Rack_chassis',(.64,2.0,.58),(x,-.61,-3.02),wallsteel,.045)
 for dx in [-.29,.29]:box('Rack_upright',(.035,2.03,.035),(x+dx,-.61,-2.71),steel,.006)
 for y in [-1.42,-.95,-.48,-.01]:
  box('Rack_drawer',(.54,.39,.04),(x,y,-2.71),paint,.009)
  for dz in range(8):box('Rack_vent',(.27,.008,.005),(x,y+.105-dz*.022,-2.686),bakelite,.001)
  for dx in [-.22,.22]:wire('Rack_pull',[(x+dx,y-.07,-2.675),(x+dx,y-.07,-2.63),(x+dx,y+.07,-2.63),(x+dx,y+.07,-2.675)],.006,steel)
 # Hidden bottom feet reinforce the grounded composition.
 for dx in [-.23,.23]:box('Rack_foot',(.08,.08,.45),(x+dx,floor+.04,-3.01),bakelite,.01)
face_main=image_mat('Hedy_transmitter_face',H/'transmitter-face.jpg',.1,.65)
face_receiver=image_mat('Hedy_receiver_face',H/'receiver-face.jpg',.1,.65)
gauge_mat=image_mat('Hedy_analog_gauge',H/'gauge.jpg',0,.8,.08)
crt=image_mat('Hedy_phosphor_CRT',H/'crt.jpg',0,.55,.3)
# Detailed main transmitter, custom educational interpretation of period equipment.
box('Main_transmitter_casing',(1.78,.85,.59),(0,-.14,-2.32),paint,.04)
picture('Main_engraved_faceplate',(1.70,.77),(0,-.14,-2.014),face_main)
for x in [-.78,.78]:
 for y in [-.47,.19]:screw((x,y,-2.001))
 wire('Radio_carry_handle',[(x-.05,-.05,-1.99),(x-.05,-.05,-1.93),(x-.05,.15,-1.93),(x-.05,.15,-1.99)],.012,steel)
for x,r in [(-.48,.115),(0,.155),(.48,.115)]:gauge(x,.015,-1.99,r)
for x,r in [(-.69,.032),(-.35,.048),(0,.065),(.35,.048),(.69,.032)]:knob(x,-.37,-1.99,r)
for x,mat in [(-.68,green),(.68,red)]:cylinder('Status_pilot',.013,.012,(x,.15,-1.98),mat,True,24)
for z in [-2.55,-2.48,-2.41,-2.34,-2.27]:box('Top_vent_slot',(1.10,.008,.014),(0,.289,z),bakelite,.003)
# Realistic side receiver and period circular CRT in their own angled cabinet assembly.
start=len(objects)
box('Receiver_cabinet',(1.0,.53,.47),(0,-.32,0),paint,.028);picture('Receiver_face',(.94,.47),(0,-.32,.244),face_receiver)
gauge(-.22,-.25,.25,.12);knob(.2,-.40,.25,.08);knob(-.35,-.48,.25,.034)
for i in range(7):box('Receiver_speaker_grille',(.24,.009,.007),(.28,-.12-i*.025,.25),bakelite,.002)
# Rotate the left receiver to face the visitor from x<0.
for o in objects[start:]:o.matrix_world=__import__('mathutils').Matrix.Translation(at((-2.25,0,-.44)))@__import__('mathutils').Matrix.Rotation(math.pi/2,4,'Z')@o.matrix_world
start=len(objects)
box('Oscilloscope_casing',(.66,.53,.48),(0,-.32,0),wallsteel,.035);cylinder('CRT_steel_bezel',.181,.032,(-.08,-.27,.24),steel,True,48)
disk_picture('CRT_display',.15,(-.08,-.27,.275),crt);knob(.23,-.20,.25,.03);knob(.23,-.42,.25,.03)
for o in objects[start:]:o.matrix_world=__import__('mathutils').Matrix.Translation(at((-2.25,0,.57)))@__import__('mathutils').Matrix.Rotation(math.pi/2,4,'Z')@o.matrix_world
# Stage 2: contextual documents, ship, cabling, lamps and architectural fittings.
chart=image_mat('Hedy_original_nautical_chart',H/'naval-chart.jpg')
box('Chart_oak_frame',(.055,1.44,2.08),(3.08,.42,.15),wood,.018)
picture('Nautical_chart',(1.95,1.32),(3.042,.42,.15),chart,'right')
# Authored small civilian steamship model: shaped hull mesh, decks, rails and rigging.
ship_origin=(2.25,-.56,.50)
verts=[]
for y,width in [(0,.05),(.05,.13),(.12,.16)]:
 for x,z in [(-width,-.40),(-width*.6,-.54),(0,-.61),(width*.6,-.54),(width,-.40),(width,.43),(width*.6,.53),(0,.58),(-width*.6,.53),(-width,.43)]:verts.append((x,-z,y))
faces=[]
for layer in range(2):
 for i in range(10):faces.append((layer*10+i,layer*10+(i+1)%10,(layer+1)*10+(i+1)%10,(layer+1)*10+i))
faces.append(tuple(range(20,30)));mesh=bpy.data.meshes.new('Steamship_hull');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('Educational_steamship_hull',mesh);scene.collection.objects.link(o);o.location=at(ship_origin);o.data.materials.append(wallsteel);projected_uv(o);objects.append(o)
box('Ship_wooden_display_base',(.42,.035,1.34),(2.25,-.58,.50),wood,.02)
box('Ship_deck',(.27,.026,.92),(2.25,-.427,.50),wood,.01)
box('Ship_superstructure',(.20,.13,.35),(2.25,-.35,.55),paper,.012)
box('Ship_bridge',(.23,.065,.15),(2.25,-.252,.40),wallsteel,.009)
for z in [.31,.40,.49]:box('Bridge_window',(.234,.027,.035),(2.25,-.25,z),bakelite,.002)
funnel_paint=material('Ship_oxide_red',(.22,.045,.023),.12,.78)
cylinder('Ship_funnel',.036,.16,(2.25,-.28,.65),funnel_paint)
for z in [-.05,1.03]:
 cylinder('Ship_mast',.004,.40,(2.25,-.41,z),steel,False,12)
 wire('Ship_rigging',[(2.25,-.41,z-.12),(2.25,-.02,z),(2.25,-.41,z+.12)],.0014,steel)
for side in [-1,1]:
 wire('Ship_railing',[(2.25+side*.12,-.36,z)for z in [-.01,.15,.35,.7,.93]],.002,steel)
 for z in [.15,.35,.7]:cylinder('Ship_rail_post',.0018,.067,(2.25+side*.12,-.427,z),steel,False,8)
# Rear documentary wall: actual patent sheet + artistic portrait + original timeline.
patent=image_mat('Hedy_patent_US2292387',ROOT/'public/assets/hedy-lamarr/media/patent-1942.webp')
art=image_mat('Hedy_educational_illustration_atlas',ROOT/'public/assets/hedy-lamarr/media/illustrations.webp')
timeline=image_mat('Hedy_timeline',H/'timeline.jpg')
for x,w,h,mat,tile in [(0,.95,1.35,patent,None),(1.31,.95,1.12,art,2),(-1.31,.95,1.12,timeline,None)]:
 box('Document_oak_frame',(w+.10,h+.10,.05),(x,.34,3.27),wood,.012);picture('Document_image',(w,h),(x,.34,3.235),mat,'rear',tile)
# Industrial glazed door and analog wall clock.
box('Rear_door_leaf',(.82,2.40,.05),(-2.55,-.42,3.28),wood,.01)
for x in [-2.98,-2.12]:box('Door_jamb',(.06,2.52,.08),(x,-.40,3.23),steel,.008)
box('Door_transom',(.94,.07,.08),(-2.55,.86,3.23),steel,.008);cylinder('Door_knob',.035,.04,(-2.24,-.43,3.20),brass,True)
clock_mat=image_mat('Hedy_clock_dial',H/'clock.jpg')
cylinder('Clock_case',.27,.06,(0,1.40,-3.30),bakelite,True,64);disk_picture('Clock_face',.24,(0,1.40,-3.231),clock_mat)
# Curved bundled cables, solder terminals and cable trays.
wire('Main_power_lead',[(.72,-.46,-2.28),(1.18,-.56,-2.5),(1.45,-.88,-2.7),(1.46,-1.53,-3.1)],.013)
wire('Receiver_signal_lead',[(-2.0,-.45,-.60),(-1.90,-.57,-.94),(-2.07,-.57,-1.20),(-2.60,-.30,-1.22),(-3.02,.54,-1.22)],.009)
wire('Headset_cable',[(-.8,-.58,-2.02),(-1.08,-.57,-1.97),(-1.25,-.59,-2.12),(-1.22,-.58,-2.34)],.008)
for x in [-3.05,3.05]:
 wire('Wall_conduit',[(x,-1.5,-2.8),(x,1.55,-2.8),(x,1.55,2.8)],.015,steel)
 for z in [-2.8,0,2.8]:box('Conduit_junction',(.09,.13,.13),(x,1.55,z),paint,.01)
# Lamp bases and rounded shades; warm emissive bulbs are visible, steady light sources.
for x,z in [(0,-1.2),(-1.6,.8)]:
 cylinder('Pendant_stem',.013,.47,(x,1.4,z),steel)
 lathe('Enamel_lampshade',[(0,.27),(.04,.25),(.14,.12),(.18,.065)],(x,1.20,z),paint,48)
 cylinder('Amber_bulb',.055,.10,(x,1.17,z),warm,False,24)
 for a in range(0,360,60):
  xx=x+math.cos(math.radians(a))*.11;zz=z+math.sin(math.radians(a))*.11;wire('Lamp_guard',[(xx,1.25,zz),(xx,1.14,zz),(x,1.12,z)],.003,steel)
# Printed papers and a small period magnifier lend a working scale to the benches.
for i in range(3):
 page=box('Loose_technical_paper',(.26,.002,.33),(1.05+i*.05,-.577+i*.003,-2.16+i*.025),paper,.001);page.rotation_euler.z=.1+i*.06
model('magnifying_glass_01','Chart_magnifier',(2.25,-.565,-.48),height=.24,rotation=.6).rotation_euler.x=math.pi/2
model('wooden_stool_01','Operator_stool',(.95,floor,-1.65),height=.62,rotation=.15)
print('ROOM_AND_EQUIPMENT_COMPLETE',len(objects),flush=True)
def area(name,pos,target,power,color,size):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=at(pos);o.rotation_euler=(at(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Main_pendant',(0,1.15,-1.2),(0,-.4,-2.4),36,(1,.68,.36),.65)
area('Side_pendant',(-1.6,1.12,.8),(-2.2,-.5,.2),25,(1,.73,.44),.65)
area('Chart_sconce',(2.8,1.35,.1),(3,.2,.1),12,(.8,.86,1),.85)
area('Archive_sconce',(0,1.45,2.5),(0,.3,3.3),10,(1,.76,.48),.9)

# Bake a neutral-white diffuse response, then restore all original PBR shaders.
# This is actual Cycles direct+indirect irradiance, not painted fake shadows.
authored_count=len(objects)
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.join()
objects=[bpy.context.object]
objects[0].name='Hedy_static_architecture_and_props'
for o in objects:
 o.select_set(True)
 if not o.data.uv_layers:o.data.uv_layers.new(name='UVMap');projected_uv(o)
 if not o.data.uv_layers.get('Lightmap'):o.data.uv_layers.new(name='Lightmap')
 o.data.uv_layers.active=o.data.uv_layers['Lightmap']
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(70),island_margin=.003,area_weight=.7,correct_aspect=True,scale_to_bounds=True);bpy.ops.object.mode_set(mode='OBJECT')
# Retain authored scene and original materials before bake material replacement.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'.runtime/hedy-authored.blend'))
original_slots={}
white=bpy.data.materials.new('Bake_white_irradiance');white.use_nodes=True
white.node_tree.nodes.clear();out=white.node_tree.nodes.new('ShaderNodeOutputMaterial');bsdf=white.node_tree.nodes.new('ShaderNodeBsdfDiffuse');bsdf.inputs['Color'].default_value=(1,1,1,1);white.node_tree.links.new(bsdf.outputs[0],out.inputs['Surface'])
image=bpy.data.images.new('Hedy_irradiance',width=2048,height=2048,float_buffer=True);image.colorspace_settings.name='Linear Rec.709'
node=white.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;white.node_tree.nodes.active=node
for o in objects:
 original_slots[o.name]=list(o.data.materials)
 for slot in o.material_slots:slot.material=white
scene.render.bake.margin=5;scene.render.bake.use_clear=True
print('BAKE_START',len(objects),sum(len(o.data.polygons) for o in objects),flush=True)
bpy.ops.object.bake(type='DIFFUSE',pass_filter={'DIRECT','INDIRECT'},uv_layer='Lightmap')
# Encode linear irradiance explicitly; never allow an 8-bit bake to clip its range.
import numpy as np
pixels=np.array(image.pixels[:],dtype=np.float32).reshape((-1,4))
positive=pixels[:,:3][pixels[:,:3]>0]
scale=max(1.,float(np.percentile(positive,99.8)))
pixels[:,:3]=np.clip(pixels[:,:3]/scale,0,1)
image.pixels.foreach_set(pixels.reshape(-1));image.update()
(ROOT/'.runtime/hedy-lightmap-scale.json').write_text(json.dumps({'scale':scale,'max':float(positive.max()),'median':float(np.median(positive))}))
image.filepath_raw=str(OUT/'irradiance.png');image.file_format='PNG';image.save()
for o in objects:
 for slot,mat in zip(o.material_slots,original_slots[o.name]):slot.material=mat
 o.data.uv_layers.active=o.data.uv_layers['UVMap'];o.data.uv_layers['UVMap'].active_render=True
# Export the geometry/materials independently from the baked irradiance atlas.
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
# Keep texture memory bounded; normal/roughness is sufficient at 1k for these props.
for img in bpy.data.images:
 if img.source=='FILE' and max(img.size)>2048:
  factor=2048/max(img.size);img.scale(round(img.size[0]*factor),round(img.size[1]*factor))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'.runtime/hedy-pbr-unoptimized.glb'),export_format='GLB',use_selection=True,export_texcoords=True,export_normals=True,export_yup=True,export_materials='EXPORT',export_image_format='AUTO',export_extras=True,export_cameras=False,export_lights=False)
# The reflection environment is rendered from this very room, not a modern HDRI.
cam_data=bpy.data.cameras.new('Reflection_panorama');cam=bpy.data.objects.new('Reflection_panorama',cam_data);scene.collection.objects.link(cam);cam.location=at((0,0,0));cam.rotation_euler=(math.pi/2,0,0);cam_data.type='PANO';cam_data.panorama_type='EQUIRECTANGULAR';scene.camera=cam
scene.render.resolution_x=1024;scene.render.resolution_y=512;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='HDR';scene.render.filepath=str(OUT/'room-reflections.hdr');scene.cycles.samples=16
bpy.ops.render.render(write_still=True)
metadata={'source':'Blender 4.5.9 / Cycles','bake':'diffuse direct + indirect','lightmapScale':scale,'samples':24,'atlas':[2048,2048],'uv':'TEXCOORD_1 / Lightmap','objects':authored_count,'polygons':sum(len(o.data.polygons) for o in objects),'fixedCamera':[0,0,0],'historicalStatus':'Educational 1940s-inspired communications room, not an authenticated workplace replica'}
(OUT/'scene-metadata.json').write_text(json.dumps(metadata,indent=2))
print('SCENE_COMPLETE',json.dumps(metadata),flush=True)
