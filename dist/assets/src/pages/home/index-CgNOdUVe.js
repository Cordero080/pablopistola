import{d as W,O as et,h as X,F as K,j as S,U as q,k as w,l as z,H as L,N as ft,T as mt,C as M,V as R,m as N,n as st,W as it,o as pt,S as at,B as P,c as gt,L as vt,p as _t,q as wt,P as bt,A as xt,D as Y,r as Mt,s as Tt,t as Ct}from"../../../three.module-Bb4hdJ5L.js";/* empty css                    */const k={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class F{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const St=new et(-1,1,1,-1,0,1);class yt extends X{constructor(){super(),this.setAttribute("position",new K([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new K([0,2,0,0,2,0],2))}}const Rt=new yt;class rt{constructor(t){this._mesh=new W(Rt,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,St)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class Pt extends F{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof S?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=q.clone(t.uniforms),this.material=new S({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new rt(this.material)}render(t,e,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class $ extends F{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,s){const a=t.getContext(),i=t.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let r,o;this.inverse?(r=0,o=1):(r=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),i.buffers.stencil.setFunc(a.ALWAYS,r,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),t.setRenderTarget(s),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(a.EQUAL,1,4294967295),i.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),i.buffers.stencil.setLocked(!0)}}class At extends F{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class Bt{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const s=t.getSize(new w);this._width=s.width,this._height=s.height,e=new z(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:L}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Pt(k),this.copyPass.material.blending=ft,this.timer=new mt}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());const e=this.renderer.getRenderTarget();let s=!1;for(let a=0,i=this.passes.length;a<i;a++){const r=this.passes[a];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),r.render(this.renderer,this.writeBuffer,this.readBuffer,t,s),r.needsSwap){if(s){const o=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),h.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}$!==void 0&&(r instanceof $?s=!0:r instanceof At&&(s=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new w);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const s=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(s,a),this.renderTarget2.setSize(s,a);for(let i=0;i<this.passes.length;i++)this.passes[i].setSize(s,a)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Ft extends F{constructor(t,e,s=null,a=null,i=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=s,this.clearColor=a,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new M}render(t,e,s){const a=t.autoClear;t.autoClear=!1;let i,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(i=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),t.autoClear=a}}const Dt={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new M(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class y extends F{constructor(t,e=1,s,a){super(),this.strength=e,this.radius=s,this.threshold=a,this.resolution=t!==void 0?new w(t.x,t.y):new w(256,256),this.clearColor=new M(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new z(i,r,{type:L}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let l=0;l<this.nMips;l++){const u=new z(i,r,{type:L});u.texture.name="UnrealBloomPass.h"+l,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);const f=new z(i,r,{type:L});f.texture.name="UnrealBloomPass.v"+l,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),i=Math.round(i/2),r=Math.round(r/2)}const o=Dt;this.highPassUniforms=q.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new S({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const h=[6,10,14,18,22];i=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let l=0;l<this.nMips;l++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(h[l])),this.separableBlurMaterials[l].uniforms.invSize.value=new w(1/i,1/r),i=Math.round(i/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new R(1,1,1),new R(1,1,1),new R(1,1,1),new R(1,1,1),new R(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=q.clone(k.uniforms),this.blendMaterial=new S({uniforms:this.copyUniforms,vertexShader:k.vertexShader,fragmentShader:k.fragmentShader,premultipliedAlpha:!0,blending:N,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new M,this._oldClearAlpha=1,this._basic=new st,this._fsQuad=new rt(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let s=Math.round(t/2),a=Math.round(e/2);this.renderTargetBright.setSize(s,a);for(let i=0;i<this.nMips;i++)this.renderTargetsHorizontal[i].setSize(s,a),this.renderTargetsVertical[i].setSize(s,a),this.separableBlurMaterials[i].uniforms.invSize.value=new w(1/s,1/a),s=Math.round(s/2),a=Math.round(a/2)}render(t,e,s,a,i){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();const r=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),i&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let o=this.renderTargetBright;for(let h=0;h<this.nMips;h++)this._fsQuad.material=this.separableBlurMaterials[h],this.separableBlurMaterials[h].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[h].uniforms.direction.value=y.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[h]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[h].uniforms.colorTexture.value=this.renderTargetsHorizontal[h].texture,this.separableBlurMaterials[h].uniforms.direction.value=y.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[h]),t.clear(),this._fsQuad.render(t),o=this.renderTargetsVertical[h];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,i&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(s),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=r}_getSeparableBlurMaterial(t){const e=[],s=t/3;for(let a=0;a<t;a++)e.push(.39894*Math.exp(-.5*a*a/(s*s))/s);return new S({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new w(.5,.5)},direction:{value:new w(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(t){return new S({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}y.BlurDirectionX=new w(1,0);y.BlurDirectionY=new w(0,1);let H=0;const Et=[];function ot(){const n=window.scrollY,t=document.documentElement.scrollHeight-window.innerHeight,e=t>0?Math.min(1,Math.max(0,n/t)):0;if(Math.abs(H-e)>5e-4){H=e;for(const s of Et)s(H)}requestAnimationFrame(ot)}requestAnimationFrame(ot);function Ut(){return H}const zt=(n,t=0,e=1)=>Math.min(e,Math.max(t,n)),_=(n,t,e)=>n+(t-n)*e,J=(n,t,e)=>zt((n-t)/(e-t)),Z=n=>n*n*(3-2*n),A=[{t:0,r:1,g:.71,b:.76},{t:.2,r:1,g:0,b:1},{t:.5,r:.2,g:.2,b:1},{t:1,r:.25,g:.88,b:.82}];function Lt(n){for(let t=0;t<A.length-1;t++){const e=A[t],s=A[t+1];if(n<=s.t){const a=(n-e.t)/(s.t-e.t);return{r:_(e.r,s.r,a),g:_(e.g,s.g,a),b:_(e.b,s.b,a)}}}return A[A.length-1]}const B=[{halfWidth:20,amplitude:90,wavelength:300,timeModifier:.2,isRibbon:!0,baseOpacity:.35,attraction:1,attractionStrength:.12,attractionDelay:.004,attractionRadius:280},{amplitude:100,wavelength:100,timeModifier:1,isRibbon:!1,baseOpacity:.45,attraction:1,attractionStrength:.8,attractionDelay:.12,attractionRadius:400},{amplitude:150,wavelength:150,timeModifier:1,isRibbon:!1,baseOpacity:.35,attraction:1,attractionStrength:.7,attractionDelay:.18,attractionRadius:350},{amplitude:100,wavelength:100,timeModifier:1,isRibbon:!1,baseOpacity:.4,attraction:1,attractionStrength:.6,attractionDelay:.09,attractionRadius:380},{amplitude:50,wavelength:80,timeModifier:1,isRibbon:!1,baseOpacity:.25,attraction:1,attractionStrength:.8,attractionDelay:.06,attractionRadius:300}],b=220,kt=Math.PI*2,Ht=Math.PI/2,Wt=18,Ot=2;class Vt{constructor(t){this._canvas=t,this._width=window.innerWidth,this._height=window.innerHeight,this._mouseX=this._width/2,this._mouseY=this._height/2,this._waveMouseX=B.map(()=>this._width/2),this._waveMouseY=B.map(()=>this._height/2),this._suck=0,this._dirFlipped=!1,this._direction=-1,this._time=0,this._lastFrame=null,this._ampScale=1,this._setupRenderer(),this._setupScene(),this._buildWaves(),this._setupBloom(),this._setupEvents(),this._accentTarget=new M(1,1,1),this._accentColor=new M(1,1,1),this._tick=this._tick.bind(this),requestAnimationFrame(this._tick)}setAccentColor(t){if(!t){this._accentTarget.set(1,1,1);return}this._accentTarget.set(1,1,1).lerp(new M(t),.3)}_setupRenderer(){this._renderer=new it({canvas:this._canvas,alpha:!0,antialias:!0,powerPreference:"high-performance"}),this._renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this._renderer.setSize(this._width,this._height),this._renderer.toneMapping=pt}_setupScene(){this._scene=new at,this._camera=new et(-this._width/2,this._width/2,this._height/2,-this._height/2,.1,100),this._camera.position.z=10}_buildWaves(){this._waves=B.map((t,e)=>t.isRibbon?this._buildRibbon(t,e):this._buildLine(t,e)),this._waves.forEach(({mesh:t})=>this._scene.add(t))}_buildRibbon(t,e){const s=(b+1)*2,a=new Float32Array(s*3),i=new Float32Array(s*3),r=new Uint16Array(b*6);for(let c=0;c<b;c++){const l=c*2,u=l+1,f=l+2,T=l+3,g=c*6;r[g]=l,r[g+1]=u,r[g+2]=f,r[g+3]=u,r[g+4]=T,r[g+5]=f}this._fillGradientColors(i,b+1,!0);const o=new X;o.setAttribute("position",new P(a,3)),o.setAttribute("color",new P(i,3)),o.setIndex(new P(r,1));const h=new st({vertexColors:!0,transparent:!0,opacity:t.baseOpacity,blending:N,depthWrite:!1,side:gt});return{mesh:new W(o,h),geo:o,mat:h,cfg:t,waveIndex:e}}_buildLine(t,e){const s=b+1,a=new Float32Array(s*3),i=new Float32Array(s*3);this._fillGradientColors(i,s,!1);const r=new X;r.setAttribute("position",new P(a,3)),r.setAttribute("color",new P(i,3));const o=new vt({vertexColors:!0,transparent:!0,opacity:t.baseOpacity,blending:N,depthWrite:!1});return{mesh:new _t(r,o),geo:r,mat:o,cfg:t,waveIndex:e}}_fillGradientColors(t,e,s){for(let a=0;a<e;a++){const i=a/(e-1),{r,g:o,b:h}=Lt(i),c=i<.12?i/.12:i>.88?(1-i)/.12:1;if(s){const l=a*6;t[l]=r*c,t[l+1]=o*c,t[l+2]=h*c,t[l+3]=r*c,t[l+4]=o*c,t[l+5]=h*c}else{const l=a*3;t[l]=r*c,t[l+1]=o*c,t[l+2]=h*c}}}_setupBloom(){this._composer=new Bt(this._renderer),this._composer.addPass(new Ft(this._scene,this._camera)),this._bloomPass=new y(new w(this._width,this._height),.4,.8,.05),this._composer.addPass(this._bloomPass)}_setupEvents(){window.addEventListener("mousemove",t=>{this._mouseX=t.clientX,this._mouseY=t.clientY}),window.addEventListener("touchmove",t=>{t.touches.length>0&&(this._mouseX=t.touches[0].clientX,this._mouseY=t.touches[0].clientY)},{passive:!0}),window.addEventListener("touchend",()=>{this._mouseX=this._width/2,this._mouseY=this._height/2},{passive:!0}),window.addEventListener("keydown",t=>{var e;if(t.code==="Space"){const s=(e=document.activeElement)==null?void 0:e.tagName;if(s==="INPUT"||s==="TEXTAREA")return;t.preventDefault(),this._direction*=-1}}),window.addEventListener("resize",()=>this._onResize())}_onResize(){this._width=window.innerWidth,this._height=window.innerHeight,this._renderer.setSize(this._width,this._height),this._composer.setSize(this._width,this._height),this._camera.left=-this._width/2,this._camera.right=this._width/2,this._camera.top=this._height/2,this._camera.bottom=-this._height/2,this._camera.updateProjectionMatrix(),this._waveMouseX=this._waveMouseX.map(()=>this._width/2),this._waveMouseY=this._waveMouseY.map(()=>this._height/2)}_edgeEnvelope(t,e){return e*(Math.sin(t*kt-Ht)+1)*.7}_sineY(t,e,s){const a=this._width*.95,i=t/b,r=i*a,o=this._time*.4*e.timeModifier+(-this._height/2+r)/e.wavelength,h=Math.sin(o),c=e.amplitude*this._ampScale*(1-this._suck*.92),l=this._edgeEnvelope(i,c),u=this._waveMouseX[s],f=this._waveMouseY[s],T=Math.abs(r-u),g=Math.pow(Math.max(0,1-T/e.attractionRadius),2),D=1-Math.abs(i-.5)*2,E=(f-this._height/2)*g*D*e.attractionStrength*e.attraction;return-(l*h+E)}_updateSuck(t){const e=t/1e3,s=Math.abs(Math.sin(e/Wt*Math.PI));this._suck=Math.pow(s,Ot),this._suck>.9&&!this._dirFlipped?(this._direction*=-1,this._dirFlipped=!0):this._suck<.1&&(this._dirFlipped=!1)}_updateMouseTracking(t){for(let e=0;e<B.length;e++){const s=B[e].attractionDelay,a=1-Math.pow(1-s,t);this._waveMouseX[e]+=(this._mouseX-this._waveMouseX[e])*a,this._waveMouseY[e]+=(this._mouseY-this._waveMouseY[e])*a}}_updateScrollEffects(t){const e=Z(J(t,.1,.4)),s=Z(J(t,.75,1));this._ampScale=_(1,1.45,e)*_(1,.75,s);const a=_(.3,1.6,e)*_(1,.45,s);this._bloomPass.strength+=(a-this._bloomPass.strength)*.04;const i=_(.55,.92,e)*_(1,.65,s),r=parseFloat(this._canvas.style.opacity)||.55;this._canvas.style.opacity=_(r,i,.05);for(const{mat:o,cfg:h}of this._waves){const c=h.baseOpacity*_(.5,1,e);o.opacity+=(c-o.opacity)*.05}}_updateWave({geo:t,cfg:e,waveIndex:s}){const a=t.attributes.position.array,i=this._width*.95,r=this._width*.025;for(let o=0;o<=b;o++){const h=o/b*i+r-this._width/2,c=this._sineY(o,e,s);if(e.isRibbon){const l=e.halfWidth*(1-this._suck*.75),u=o*6;a[u]=h,a[u+1]=c+l,a[u+2]=0,a[u+3]=h,a[u+4]=c-l,a[u+5]=0}else{const l=o*3;a[l]=h,a[l+1]=c,a[l+2]=0}}t.attributes.position.needsUpdate=!0}_tick(t){const e=Math.min((t-(this._lastFrame??t))/16.667,3);this._lastFrame=t,this._time+=.007*this._direction,this._updateSuck(t),this._updateMouseTracking(e),this._updateScrollEffects(Ut()),this._accentColor.lerp(this._accentTarget,.02);for(const{mat:s}of this._waves)s.color.copy(this._accentColor);for(const s of this._waves)this._updateWave(s);this._composer.render(),requestAnimationFrame(this._tick)}}function It(){const n=document.querySelectorAll(".project-row");if(!n.length)return;const t=Array.from(n).map(s=>({row:s,media:s.querySelector(".project-card-media")})).filter(s=>s.media);function e(){const s=window.innerHeight/2;for(const{media:a}of t){const i=a.getBoundingClientRect();if(i.bottom<-200||i.top>window.innerHeight+200)continue;const o=(i.top+i.height/2-s)*.08;a.style.setProperty("--py",`${o.toFixed(2)}px`)}requestAnimationFrame(e)}requestAnimationFrame(e)}function Qt(){const n=document.querySelectorAll(".project-row");if(!n.length)return;const t=new Set;function e(){var o,h;if(t.size===0){(o=window.waveScene)==null||o.setAccentColor(null);return}const a=window.innerHeight/2;let i=null,r=1/0;for(const c of t){const l=c.getBoundingClientRect(),u=Math.abs(l.top+l.height/2-a);u<r&&(r=u,i=c)}if(i){const c=getComputedStyle(i).getPropertyValue("--card-accent").trim();(h=window.waveScene)==null||h.setAccentColor(c||null)}}const s=new IntersectionObserver(a=>{for(const i of a)i.isIntersecting?t.add(i.target):t.delete(i.target);e()},{threshold:.2});for(const a of n)s.observe(a)}document.addEventListener("DOMContentLoaded",()=>{const n=document.getElementById("waves");n&&(window.waveScene=new Vt(n),It(),Qt())});const x=document.querySelector(".hero-section");var tt;if(x&&window.innerWidth>600){let o=function(){const d=new Ct,p=.38,m=2,v=.18;return d.moveTo(0,0),d.lineTo(p,0),d.lineTo(p,v),d.lineTo(v,v),d.lineTo(v,m-v),d.lineTo(p,m-v),d.lineTo(p,m),d.lineTo(0,m),d.closePath(),d},T=function(){const d=x.getBoundingClientRect(),p=d.width,m=Math.max(d.height,180);t.setSize(p,m),n.style.height=m+"px",s.aspect=p/m,s.updateProjectionMatrix();const v=p<=600,nt=s.fov*Math.PI/180,j=2*Math.tan(nt/2)*s.position.z,lt=j*s.aspect,V=j/m,ht=v?.19:p<=900?.2:.18,C=m*ht*V/2.2;u.scale.set(C,C,C),f.scale.set(C,C,C);let I;const U=x.querySelector(".hero-title"),ct=U?U.getBoundingClientRect().width/2:p*.28;I=Math.min((ct+(v?18:32))*V,lt*.46),u.position.x=-I+.18,f.position.x=I;const ut=x.getBoundingClientRect(),Q=U?U.getBoundingClientRect():null,dt=Q?Q.top-ut.top+Q.height/2:m/2,G=(m/2-dt)*V+(p>1e3||p>900?.55:0);u.position.y=G,f.position.y=G,f.position.z=-.23},D=function(){requestAnimationFrame(D),g+=.004;const d=Math.sin(g*.5)*.06;u.rotation.y=d,f.rotation.y=Math.PI-d,t.render(e,s)},E=function(d){n.style.display=d?"none":"",l.needsUpdate=!0};const n=document.createElement("canvas");n.style.cssText=`
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 1;
  `,x.appendChild(n);const t=new it({canvas:n,alpha:!0,antialias:!0});t.setPixelRatio(Math.min(window.devicePixelRatio,2)),t.outputColorSpace=wt;const e=new at,s=new bt(50,1,.1,100);s.position.z=5,e.add(new xt(16777215,.01));const a=new Y(16777215,2);a.position.set(3,4,3),e.add(a);const i=new Y(16777215,3);i.position.set(.1,0,3),e.add(i);const r=new Y(16777215,2);r.position.set(0,-5,4),e.add(r);const h={depth:.36,bevelEnabled:!0,bevelSegments:4,bevelSize:.04,bevelThickness:.04},c=new Mt(o(),h);c.translate(-.11,-1,-.14);const l=new Tt({color:328965,specular:16777215,shininess:180}),u=new W(c,l);e.add(u);const f=new W(c,l);f.rotation.y=Math.PI,e.add(f);let g=0;window.addEventListener("scroll",()=>{const d=x.getBoundingClientRect(),p=x.offsetHeight,m=Math.max(0,-d.top),v=Math.min(1,m/(p*.4));n.style.opacity=1-v,n.style.transform=`translateY(${m}px)`},{passive:!0}),window.addEventListener("resize",()=>requestAnimationFrame(T));const O=()=>requestAnimationFrame(()=>{T(),D()});(tt=document.fonts)!=null&&tt.ready?document.fonts.ready.then(O):O(),E(document.body.classList.contains("complementary-colors")),new MutationObserver(()=>{E(document.body.classList.contains("complementary-colors"))}).observe(document.body,{attributes:!0,attributeFilter:["class"]})}
