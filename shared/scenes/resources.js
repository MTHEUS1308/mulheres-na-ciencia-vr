// Dispose scene-owned resources exactly once. Global camera/UI are never children
// of these scenes. Current Three.js render-target textures retain their owner.
export function disposeEnvironment({scene,lab}) {
 const geometries=new Set(),materials=new Set(),textures=new Set(),renderTargets=new Set(),images=new Set();
 scene.traverse(object=>{
  if(object.geometry)geometries.add(object.geometry);
  if(object.isInstancedMesh)object.dispose();
  for(const material of Array.isArray(object.material)?object.material:[object.material])if(material){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);for(const uniform of Object.values(material.uniforms??{}))if(uniform.value?.isTexture)textures.add(uniform.value);}
 });
 for(const texture of [scene.environment,scene.background])if(texture?.isTexture)textures.add(texture);
 if(lab?.environment?.isWebGLRenderTarget)renderTargets.add(lab.environment);
 for(const texture of textures){if(texture.renderTarget)renderTargets.add(texture.renderTarget);if(texture.image&&typeof texture.image.close==='function')images.add(texture.image);}
 lab?.dispose?.();
 for(const target of renderTargets)target.dispose();
 for(const texture of textures)texture.dispose();
 for(const geometry of geometries)geometry.dispose();
 for(const material of materials)material.dispose();
 for(const image of images)image.close();
 scene.clear();scene.environment=null;scene.background=null;
 return {geometries:geometries.size,materials:materials.size,textures:textures.size,renderTargets:renderTargets.size};
}
