struct Out {
    @builtin(position) pos: vec4f,
};

struct In {
    @location(0) pos: vec3f,
};

struct Globals {
    perspective: mat4x4f,        
    view_transform: mat4x4f,
};
struct PerInstance{
    transform: mat4x4f,  
};

@group(0) @binding(0) var<uniform> g: Globals;
@group(0) @binding(1) var<storage,read> inst: array<PerInstance>;

    
@vertex fn vs(i:In, @builtin(instance_index) idx:u32)->Out{
    var o:Out;
    var p: vec4f = g.perspective * g.view_transform *inst[idx].transform*  vec4(i.pos,1.0); 
    o.pos = p; 
    return o;
}
