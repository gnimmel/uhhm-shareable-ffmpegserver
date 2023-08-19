#define PI 3.14159265359

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_offset;
uniform float u_zoom;
uniform sampler2D u_text;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

float rand(vec2 co){
  return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}

float Plot(float y, float width) {
	return step(y, width) * step(-width, y);
}

vec2 TransformedUV(vec2 uv) {
	uv -= .5;
	uv += u_offset / u_resolution.xy;
	uv *= u_zoom;
	return uv;
}

void main() {
	float c = 0.;
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;	
	vec2 mouse = uv*u_mouse / gl_FragCoord.xy;
	
	uv = TransformedUV(uv);
	mouse = TransformedUV(mouse);
	
	uv.x += sin(uv.y*3.) * .1;
	uv.y += sin(uv.x*10.) * .1;
	
	uv.x += rand(uv*20.) * .5;
	
	float f_sin = Plot(uv.y + sin(uv.x + u_time), 0.001*u_zoom);
	f_sin = fract(uv.y + sin(uv.x + u_time));
	
	float mask = 0.;
	mask = sin(min(length(uv), 4.)) / 2. + .5;
	f_sin *= mask;
	
	f_sin = step(0.5, f_sin);
	
	c += f_sin;
	
	vec2 t_uv = gl_FragCoord.xy / u_resolution.xy;
	t_uv.x += sin(t_uv.y*3.) * .1;
	t_uv.y += sin(t_uv.x*10.+u_time) * .1;
	t_uv += rand(uv) * .01;
	t_uv.y = 1.-t_uv.y;
	float text = texture2D(u_text, t_uv).r;
	
	c = clamp(0., 1., c);
  	vec3 col = vec3(c);
	
	//vec3 color1 = vec3(0.92, 0.36, 0.01);
	//vec3 color2 = vec3(.88, .80, .94);
	//vec3 color3 = vec3(.0, .22, .77);
	
	col = mix(u_color1, u_color3, c);
	col = mix(col, u_color2, text);
  
  gl_FragColor = vec4(col,1.0); 
}