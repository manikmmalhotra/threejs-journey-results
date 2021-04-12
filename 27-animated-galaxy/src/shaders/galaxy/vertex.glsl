uniform float uSize;
uniform float uTime;
uniform float uHoleSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Spin
  float angle = atan(modelPosition.x, modelPosition.z);
  float distanceToCenter = length(modelPosition.xz) + uHoleSize;
  float uTimeOffset = uTime + pow(100.0, uHoleSize );
  float angleOffset = (1.0 / distanceToCenter) * uTimeOffset * 0.2;
  angle += angleOffset;
  
  modelPosition.x = cos(angle) * distanceToCenter;
  modelPosition.z = sin(angle) * distanceToCenter;  
  modelPosition.xyz += aRandomness; 

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;


  gl_Position = projectedPosition; 
  float scale = uSize * aScale;
  
  gl_PointSize = scale;
  gl_PointSize *= ( 1.0 / - viewPosition.z );
  vColor = color;
}