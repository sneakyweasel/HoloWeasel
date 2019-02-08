const int size  = @SIZE;

uniform sampler2D t_oPos;
uniform sampler2D t_pos;
uniform sampler2D t_og;
uniform sampler2D t_audio;
uniform float dT;
uniform float timer;

uniform vec3 repelers[ size ];
uniform vec3 velocities[ size ];
uniform vec3 radii[ size ];
uniform vec3 power[ size ];

uniform float repulsionPower;
uniform float repulsionRadius;
uniform float dampening;

varying vec2 vUv;

uniform mat4 newModelMatrix;


void main(){


  
  vec4 oPos = texture2D( t_oPos , vUv );
  vec4 pos  = texture2D( t_pos , vUv );

  vec4 og   = newModelMatrix * vec4(texture2D( t_og , vUv ).xyz , 1.);
  vec3 vel  = pos.xyz - oPos.xyz;
  vec3 p    = pos.xyz;

  float life = pos.w;
  
  vec3 f = vec3( 0. , 0. , 0. );
 
  vec3 dif = pos.xyz - og.xyz;

  vec3 repel = pos.xyz - vec3( 1. , 0. , 0. );

  for( int i = 0; i < size; i++ ){

    vec3  rP = repelers[ i ];
    vec3  rD = pos.xyz - rP;
    float rL = max(1. + sin(timer) * .5 , length( rD ) );
    vec3  rN = normalize( rD );

    float p = power[i].x;
    if( rL < p * p  * repulsionRadius ){

      f +=  repulsionPower  *  p * rN / (rL);

    }


  }

  f += sin( pos.x * .1  * sin( timer * 1.4 ) + timer )  * 2. * sin( timer * .7 + 12.2);
  f += sin( pos.y * .1  * sin( timer  * 1.2) + timer * 1.6 + 4. ) * 2. * sin( timer * .9 + 663.2);;
  f += sin( pos.z * .1  * sin( timer * 1.5 ) + timer * 1.2 + 10.) * 2. * sin( timer * .5 + 1231.2);;


  f -= dif;
 
  vel += f*min( .1 , dT);
  vel *= dampening;
  p += vel * 1.;//speed;*/



  //gl_FragColor = vec4( og.xyz + sin( timer ) * 1.* vec3( vUv.x , vUv.y , 0. ), 1.  );
  gl_FragColor = vec4( p , life );

}
