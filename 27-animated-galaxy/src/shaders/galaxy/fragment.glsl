varying vec3 vColor;
varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  gl_FragColor = vec4( vColor, 1.0 );
  gl_FragColor = gl_FragColor * texture2D(uTexture, vec2( gl_PointCoord.x, gl_PointCoord.y ) );
  gl_FragColor = gl_FragColor * vec4( vColor, 1.0 );
}