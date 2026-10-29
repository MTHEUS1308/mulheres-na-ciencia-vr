"""Run with Blender 4.5 LTS -b --python scripts/build-curie-scene.py.
Creates an authored historical interpretation with CC0 PBR objects and a real
Cycles irradiance bake. No scene navigation, sensor, or gaze code lives here.
"""
import bpy, math, random, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'.runtime/art-source'
OUT=ROOT/'public/assets/marie-curie';OUT.mkdir(parents=True,exist_ok=True)
random.seed(1898)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.cycles.max_bounces=6;scene.cycles.diffuse_bounces=4;scene.cycles.glossy_bounces=3;scene.cycles.transmission_bounces=4
scene.world.color=(.12,.12,.12)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.48,.56,.65,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.008
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

# Architecture has actual window openings and timber reveals rather than bright panels.
box('Oak_floor',(9.2,.16,9.6),(0,floor-.08,0),wood,.005)
box('Lime_ceiling',(9.2,.15,9.6),(0,2.28,0),plaster)
box('North_plaster',(9.2,4,.2),(0,.28,-4.8),plaster)
box('South_plaster',(9.2,4,.2),(0,.28,4.8),plaster)
box('East_plaster',(.2,4,9.6),(4.6,.28,0),plaster)
# Left wall, two openings z=-2.3 and z=1.8, each 1.6m wide.
for a,b in [(-4.8,-3.1),(-1.5,1),(2.6,4.8)]:box('Window_wall_pier',(.2,4,b-a),(-4.6,.28,(a+b)/2),plaster)
for z in [-2.3,1.8]:
 box('Window_wall_below',(.2,.88,1.6),(-4.6,-1.21,z),plaster)
 box('Window_wall_above',(.2,.75,1.6),(-4.6,1.98,z),plaster)
 # Deep oak sill and beveled sash profiles, aged wood grain.
 box('Deep_window_sill',(.48,.12,1.95),(-4.47,-.72,z),wood,.018)
 for side in [-.87,.87]:box('Window_jamb',(.2,2.6,.12),(-4.48,.55,z+side),wood,.008)
 for y in [-.69,1.78]:box('Window_lintel',(.19,.12,1.8),(-4.48,y,z),wood,.008)
 for dz in [-.4,.4]:box('Sash_mullion',(.09,2.4,.035),(-4.47,.55,z+dz),wood,.004)
 for y in [-.1,.75]:box('Sash_transom',(.09,.035,1.7),(-4.47,y,z),wood,.004)
 # Exterior soft courtyard light; no modern object visible outside.
 exterior=material('Courtyard_diffuse',(.065,.085,.11),0,1)
 p=exterior.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(.10,.15,.22,1);p.inputs['Emission Strength'].default_value=.025
 box('Courtyard_beyond_window',(.04,2.5,1.75),(-4.83,.55,z),exterior,0)
for z in [-4.65,4.65]:box('Timber_skirting',(9,.16,.07),(0,floor+.1,z),wood,.01)
for x in [-4.45,4.45]:box('Timber_skirting_side',(.07,.16,9.3),(x,floor+.1,0),wood,.01)
for x in [-3.8,0,3.8]:box('Overhead_beam',(.18,.22,9.4),(x,2.08,0),wood,.02)
# Heavy PBR benches with working clearance around the fixed visitor position.
model('wooden_table_02','Window_workbench',(-2.25,floor,.35),dimensions=(2.6,.99,.85),rotation=math.pi/2)
model('wooden_table_02','East_workbench',(2.25,floor,.35),dimensions=(2.6,.99,.85),rotation=math.pi/2)
model('wooden_bookshelf_worn','Archive_shelves',(2.8,floor,4.3),dimensions=(2.2,2.65,.48))
model('wooden_stool_01','Turned_stool',(.8,floor,-1.85),height=.64,rotation=-.3)
model('wooden_stool_01','Window_stool',(-1.95,floor,1.85),height=.65,rotation=.5)
model('stone_01','Second_mineral',(2.25,-.64,.15),height=.15,rotation=2.1,decimate=.14)
model('book_encyclopedia_set_01','Bound_archive',(2.8,-.7,4.22),dimensions=(1.8,.35,.28),decimate=.3)
model('book_encyclopedia_set_01','Bound_archive_upper',(2.8,.05,4.22),dimensions=(1.8,.33,.28),decimate=.3)
model('vintage_oil_lamp','East_oil_lamp',(2.35,-.66,1.03),height=.43,rotation=-.55)
# Main table stage: authored assembly and licensed higher-resolution tabletop.
import sys
sys.path.insert(0,str(ROOT/'scripts'))
from curie_main_table import build as build_main_table
main_table_metadata=build_main_table(globals())
# A notebook with curved leaves, stitched spine and actual page edges.
notebook=box('Research_notebook',(.44,.035,.34),(-2.25,-.64,.10),leather,.015);notebook.rotation_euler.z=.18
for i in range(11):
 leaf=box('Notebook_leaf',(.41,.0018,.32),(-2.25,-.62+i*.0019,.10),paper,.001);leaf.rotation_euler.z=.18+i*.002
for x in [-.5,.6]:
 box('Nobel_document_frame',(.8,1.08,.045),(x,.25,4.62),wood,.015)
 box('Nobel_document_paper',(.69,.94,.01),(x,.25,4.59),paper,.002)
# Small framed research diagram supplies historical context and spatial depth.
board=box('Research_diagram_frame',(2.1,1.45,.06),(0,.75,-4.63),wood,.02)
board=box('Research_diagram_slate',(1.97,1.32,.015),(0,.75,-4.59),ebonite,.005)
# Original illustrated documents and notes; never presented as archival originals.
def illustrated_material(name,filename):
 m=material(name,(.8,.7,.5),0,.95)
 n=m.node_tree.nodes;t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(SOURCE/'documents'/filename));uv=n.new('ShaderNodeUVMap');uv.uv_map='UVMap';m.node_tree.links.new(uv.outputs[0],t.inputs['Vector']);m.node_tree.links.new(t.outputs['Color'],n.get('Principled BSDF').inputs['Base Color']);return m
notes=illustrated_material('Handwritten_educational_notes','research-notes.jpg')
chalk=illustrated_material('Qualitative_chalk_diagram','chalkboard.jpg')
board.data.materials.clear();board.data.materials.append(chalk)
for loop in board.data.loops:
 co=board.data.vertices[loop.vertex_index].co;board.data.uv_layers['UVMap'].data[loop.index].uv=(co.x/board.dimensions.x+.5,co.z/board.dimensions.z+.5)
for o in objects:
 if o.name.startswith('Working_paper') or o.name=='Notebook_leaf.010':
  o.data.materials.clear();o.data.materials.append(notes)
  for loop in o.data.loops:
   co=o.data.vertices[loop.vertex_index].co;o.data.uv_layers['UVMap'].data[loop.index].uv=(co.x/o.dimensions.x+.5,co.y/o.dimensions.y+.5)
 if o.name.startswith('Nobel_document_paper'):
  o.data.materials.clear();o.data.materials.append(illustrated_material(o.name+'illustration','nobel-1903.jpg' if o.name=='Nobel_document_paper' else 'nobel-1911.jpg'))
  for loop in o.data.loops:
   co=o.data.vertices[loop.vertex_index].co;o.data.uv_layers['UVMap'].data[loop.index].uv=(co.x/o.dimensions.x+.5,co.z/o.dimensions.z+.5)
# Lighting placed at physical openings and at the oil lamp. No dynamic shadow cost in VR.
def area(name,pos,target,power,color,size):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='RECTANGLE';data.size=size;data.size_y=size*1.3
 o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=at(pos);o.rotation_euler=(at(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Overcast_window_key',(-4.37,.9,-2.3),(0,-.6,-2),18,(.63,.75,1),2.0)
area('Window_fill',(-4.37,.9,1.8),(0,-.5,1),10,(.63,.75,1),1.9)
area('Oil_warmth',(1.22,-.16,-2.4),(.25,-.50,-2.05),10,(1,.55,.25),.22)
area('Ceiling_bounce',(0,1.85,-1.5),(0,-.5,-2.3),1.5,(.87,.72,.53),3)
area('East_lamp_warmth',(2.35,-.34,1.03),(2.25,-.62,.25),8,(1,.57,.29),.20)
# Bake a neutral-white diffuse response, then restore all original PBR shaders.
# This is actual Cycles direct+indirect irradiance, not painted fake shadows.
authored_count=len(objects)
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.join()
objects=[bpy.context.object]
objects[0].name='Curie_static_architecture_and_props'
for o in objects:
 o.select_set(True)
 if not o.data.uv_layers:o.data.uv_layers.new(name='UVMap');projected_uv(o)
 if not o.data.uv_layers.get('Lightmap'):o.data.uv_layers.new(name='Lightmap')
 o.data.uv_layers.active=o.data.uv_layers['Lightmap']
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(70),island_margin=.003,area_weight=.7,correct_aspect=True,scale_to_bounds=True);bpy.ops.object.mode_set(mode='OBJECT')
# Retain authored scene and original materials before bake material replacement.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'.runtime/curie-authored.blend'))
original_slots={}
white=bpy.data.materials.new('Bake_white_irradiance');white.use_nodes=True
white.node_tree.nodes.clear();out=white.node_tree.nodes.new('ShaderNodeOutputMaterial');bsdf=white.node_tree.nodes.new('ShaderNodeBsdfDiffuse');bsdf.inputs['Color'].default_value=(1,1,1,1);white.node_tree.links.new(bsdf.outputs[0],out.inputs['Surface'])
image=bpy.data.images.new('Curie_irradiance',width=2048,height=2048,float_buffer=True);image.colorspace_settings.name='Linear Rec.709'
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
(ROOT/'.runtime/curie-lightmap-scale.json').write_text(json.dumps({'scale':scale,'max':float(positive.max()),'median':float(np.median(positive))}))
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
bpy.ops.export_scene.gltf(filepath=str(ROOT/'.runtime/curie-pbr-unoptimized.glb'),export_format='GLB',use_selection=True,export_texcoords=True,export_normals=True,export_yup=True,export_materials='EXPORT',export_image_format='AUTO',export_extras=True,export_cameras=False,export_lights=False)
# The reflection environment is rendered from this very room, not a modern HDRI.
cam_data=bpy.data.cameras.new('Reflection_panorama');cam=bpy.data.objects.new('Reflection_panorama',cam_data);scene.collection.objects.link(cam);cam.location=at((0,0,0));cam.rotation_euler=(math.pi/2,0,0);cam_data.type='PANO';cam_data.panorama_type='EQUIRECTANGULAR';scene.camera=cam
scene.render.resolution_x=1024;scene.render.resolution_y=512;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='HDR';scene.render.filepath=str(OUT/'room-reflections.hdr');scene.cycles.samples=16
bpy.ops.render.render(write_still=True)
metadata={'sideTables':{'left':[-2.25,-.66,.35],'right':[2.25,-.66,.35],'nearestEdge':1.825},'lighting':{'windowKeyWatts':18,'windowFillWatts':10,'worldStrength':.008,'courtyardEmission':.025},'mainTable':main_table_metadata,'source':'Blender 4.5.9 / Cycles','bake':'diffuse direct + indirect, neutral white response','lightmapScale':scale,'samples':24,'atlas':[2048,2048],'uv':'TEXCOORD_1 / Lightmap','objects':authored_count,'polygons':sum(len(o.data.polygons) for o in objects),'fixedCamera':[0,0,0],'historicalStatus':'Artistic educational reconstruction, not an authenticated replica'}
(OUT/'scene-metadata.json').write_text(json.dumps(metadata,indent=2))
print('SCENE_COMPLETE',json.dumps(metadata),flush=True)
