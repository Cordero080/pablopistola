/**
 * QUANTUM CONSTELLATION CURSOR UNIVERSE ENGINE
 * Controls the behavior of the QuantumCursor component
 * Creates energy waves and interactive cursor elements
 */
export default class QuantumCursorUniverse {
  constructor() {
    this.cursor = document.getElementById('cursor');
    this.gravityField = document.getElementById('gravity-field');
    this.dimensionalRift = document.getElementById('dimensional-rift');

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;

    this.energyWaves = [];
    this.maxEnergyWaves = 3;

    this.isMouseMoving = false;
    this.moveTimeout = null;
    this.quantumState = 0;
    this.dimensionalTear = false;
    this.isOverControl = false;

    this.init();
  }

  init() {
    this.createEnergyWaves();

    document.addEventListener('mousemove', (e) => this.updateMousePosition(e));
    document.addEventListener('click', (e) => {
      if (!this.isInGeomLab() && !this.isOverControl) {
        this.createWormhole();
      }
    });
    document.addEventListener('mousedown', (e) => {
      if (!this.isInGeomLab() && !this.isOverControl) {
        this.createDimensionalRift();
      }
    });
    document.addEventListener('mouseup', () => this.closeDimensionalRift());

    this.animate();
  }

  isInGeomLab() {
    return window.location.pathname.includes('/geom-lab');
  }

  updateMousePosition(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    const target = e.target;
    const clickable = target.closest(
      'a, button, [role="button"], [tabindex], label, select, input'
    );
    this.isOverControl =
      !!clickable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'LABEL' ||
      target.classList.contains('section-header') ||
      target.classList.contains('controls');

    if (this.cursor) {
      if (this.isInGeomLab()) {
        this.cursor.style.opacity = '0';
      } else {
        this.cursor.style.opacity = '1';
      }
    }

    this.isMouseMoving = true;
    clearTimeout(this.moveTimeout);
    this.moveTimeout = setTimeout(() => {
      this.isMouseMoving = false;
    }, 100);
  }

  createEnergyWaves() {
    for (let i = 0; i < this.maxEnergyWaves; i++) {
      const wave = document.createElement('div');
      wave.className = 'energy-wave';
      document.body.appendChild(wave);

      this.energyWaves.push({
        element: wave,
        angle: (360 / this.maxEnergyWaves) * i,
        distance: 15,
        speed: 1.5,
      });
    }
  }

  destroy() {
    this.energyWaves.forEach(({ element }) => element.remove());
    this.energyWaves = [];
    this._destroyed = true;
  }

  createDimensionalRift() {
    this.dimensionalTear = true;
    if (this.dimensionalRift) {
      this.dimensionalRift.style.opacity = '1';
      this.dimensionalRift.style.left = this.mouseX - 150 + 'px';
      this.dimensionalRift.style.top = this.mouseY + 'px';
      this.dimensionalRift.style.transform = `rotate(${Math.random() * 360}deg)`;
    }
  }

  createWormhole() {
    const wormhole = document.getElementById('wormhole');
    if (wormhole) {
      wormhole.style.opacity = '1';
      wormhole.style.left = this.mouseX + 'px';
      wormhole.style.top = this.mouseY + 'px';
      wormhole.style.transform = 'translate(-50%, -50%) scale(0)';

      requestAnimationFrame(() => {
        wormhole.style.transition = 'all 0.8s ease-out';
        wormhole.style.transform = 'translate(-50%, -50%) scale(3)';
        wormhole.style.opacity = '0';
      });

      setTimeout(() => {
        wormhole.style.transition = 'none';
        wormhole.style.transform = 'translate(-50%, -50%) scale(0)';
      }, 800);
    }
  }

  closeDimensionalRift() {
    this.dimensionalTear = false;
    if (this.dimensionalRift) {
      this.dimensionalRift.style.opacity = '0';
    }
  }

  updatePhysics() {
    this.targetX = this.mouseX;
    this.targetY = this.mouseY;

    if (this.cursor) {
      this.cursor.style.left = `${this.targetX}px`;
      this.cursor.style.top = `${this.targetY}px`;
      this.cursor.style.transform = `translate(-50%, -50%) scale(${0.7 + Math.sin(this.quantumState * 3) * 0.15})`;

      const baseHue = 220 + ((this.quantumState * 100) % 80);

      this.cursor.style.boxShadow = `
        0 0 4px 1px hsl(${baseHue}, 100%, 70%),
        0 0 8px 2px hsl(${220 + ((baseHue + 30) % 80)}, 100%, 60%),
        0 0 12px 3px hsl(${220 + ((baseHue + 50) % 80)}, 80%, 55%),
        0 0 16px 4px hsl(${260}, 70%, 50%, 0.6),
        inset 0 0 4px hsl(${220 + ((baseHue + 20) % 80)}, 100%, 80%)
      `;

      this.cursor.style.background = `
        radial-gradient(circle,
          hsl(${baseHue}, 100%, 95%) 0%,
          hsl(${220 + ((baseHue + 30) % 80)}, 100%, 85%) 30%,
          hsl(${220 + ((baseHue + 50) % 80)}, 90%, 75%) 60%,
          hsl(${270}, 80%, 65%) 100%
        )
      `;

      this.cursor.style.width = '20px';
      this.cursor.style.height = '20px';
    }

    if (this.gravityField) {
      this.gravityField.style.left = this.mouseX - 30 + 'px';
      this.gravityField.style.top = this.mouseY - 30 + 'px';

      if (this.isInGeomLab()) {
        this.gravityField.style.opacity = '0';
      } else {
        this.gravityField.style.opacity = '0.7';
      }
    }

    this.energyWaves.forEach((wave, index) => {
      wave.angle += wave.speed * 0.8;
      const radians = (wave.angle * Math.PI) / 180;
      const dynamicDistance = 15 + Math.sin(this.quantumState + index) * 3;
      const waveX = this.targetX + Math.cos(radians) * dynamicDistance;
      const waveY = this.targetY + Math.sin(radians) * dynamicDistance;

      wave.element.style.left = waveX + 'px';
      wave.element.style.top = waveY + 'px';
      wave.element.style.transform = `rotate(${wave.angle}deg) scale(${
        0.8 + Math.sin(this.quantumState * 2) * 0.3
      })`;

      const waveOpacity = this.isMouseMoving ? 0.7 : 0.4;
      wave.element.style.opacity = waveOpacity;

      const hue = (index * 60 + this.quantumState * 30) % 360;
      wave.element.style.background = `rgba(0, 255, 255, 0.6)`;
      wave.element.style.borderColor = `hsl(${hue}, 100%, 70%)`;
      wave.element.style.boxShadow = `0 0 8px hsl(${hue}, 100%, 70%)`;
    });

    this.quantumState += 0.015;
  }

  animate() {
    if (this._destroyed) return;
    this.updatePhysics();
    requestAnimationFrame(() => this.animate());
  }
}
