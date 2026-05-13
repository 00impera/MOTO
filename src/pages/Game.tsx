import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

const CHARACTERS = [
  { id:1,  name:'CRYPTO ENFORCER', img:'1caracter.png.jpg',   coins:'x1'   },
  { id:2,  name:'ETH WARRIOR',     img:'2caracter.png.jpg',   coins:'x1.5' },
  { id:3,  name:'USDC SUIT',       img:'3caracter.png.jpg',   coins:'x2'   },
  { id:4,  name:'BTC KING',        img:'4caracter.png.jpg',   coins:'x3'   },
  { id:5,  name:'BTC MINER',       img:'5caracter.png.jpg',   coins:'x3'   },
  { id:6,  name:'COD OPERATOR',    img:'6caracter.png.jpg',   coins:'x2.5' },
  { id:7,  name:'ENFORCER II',     img:'7caracter.png.jpg',   coins:'x2'   },
  { id:8,  name:'MECH-PHANTOM',    img:'8caracters.png.jpg',  coins:'x4'   },
  { id:9,  name:'VOID RUNNER',     img:'9caracters.png.jpg',  coins:'x3.5' },
  { id:10, name:'NEON GHOST',      img:'10caracters.png.jpg', coins:'x3'   },
  { id:11, name:'MONAD RIDER',     img:'11caracters.png.jpg', coins:'x5'   },
  { id:12, name:'CYBER TITAN',     img:'12caracters.png.jpg', coins:'x4.5' },
]

const CARS = [
  { id:1, name:'LAMBO',    img:'lambo.png.jpg',  turbo:1.4, armor:1.0, weight:0.9, neon:'#FFD700' },
  { id:2, name:'JEEP',     img:'jeep.png.jpg',   turbo:1.1, armor:1.8, weight:1.5, neon:'#39FF14' },
  { id:3, name:'MOTO',     img:'moto.png.jpg',   turbo:1.6, armor:0.7, weight:0.6, neon:'#00EAFF' },
  { id:4, name:'MOTO II',  img:'motoo.png.jpg',  turbo:1.5, armor:0.8, weight:0.7, neon:'#a259ff' },
  { id:5, name:'POLICE',   img:'police.png.jpg', turbo:1.2, armor:1.3, weight:1.1, neon:'#ff6ec7' },
  { id:6, name:'BODY',     img:'body.jpeg',      turbo:1.3, armor:1.1, weight:1.0, neon:'#C8960C' },
]

const ENEMY_IMGS = [
  { key:'AUSD',   ext:'jpg'  },
  { key:'BITCOIN',ext:'jpg'  },
  { key:'DUST',   ext:'jpg'  },
  { key:'ETH',    ext:'jpg'  },
  { key:'GIGA',   ext:'jpg'  },
  { key:'GMON',   ext:'jpg'  },
  { key:'MOFU',   ext:'jpg'  },
  { key:'MONKA',  ext:'jpg'  },
  { key:'MOON',   ext:'jpg'  },
  { key:'SBITE',  ext:'jpg'  },
  { key:'SOLANA', ext:'jpg'  },
  { key:'USDC',   ext:'jpeg' },
  { key:'USDT',   ext:'jpg'  },
  { key:'WBTC',   ext:'jpg'  },
  { key:'WETH',   ext:'jpg'  },
  { key:'WMON',   ext:'jpg'  },
  { key:'cbBTC',  ext:'jpg'  },
]

const OBSTACLE_IMGS = [
  { key:'cilindre', file:'CILINDRE.PNG.jpg'       },
  { key:'helper',   file:'HELPER.PNG.jpeg'         },
  { key:'machgun',  file:'MACHINE GUN.PNG.jpeg'    },
  { key:'orbs',     file:'ORBS,PNG.jpg'            },
]

// All neon/gold colors
const COIN_COLORS   = [0xFFD700, 0xC8960C, 0xFFE566, 0xB8860B]
const LASER_COLORS  = [0xFFD700, 0x39FF14, 0x00EAFF, 0xFF2244, 0xa259ff, 0xFF6EC7, 0xFFE566, 0xFFFFFF]
const EXPLODE_COLORS= [0xFFD700, 0x39FF14, 0x00EAFF, 0xa259ff, 0xFF6EC7, 0xC8960C, 0xFFFFFF, 0xFF2244]

// ─── Audio Engine ─────────────────────────────────────────────────────────────
class AudioEngine {
  ctx: AudioContext
  bgGain: GainNode
  sfxGain: GainNode
  bgPlaying = false

  constructor() {
    this.ctx = new AudioContext()
    this.bgGain  = this.ctx.createGain(); this.bgGain.gain.value  = 0.18; this.bgGain.connect(this.ctx.destination)
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.35; this.sfxGain.connect(this.ctx.destination)
  }

  engineOsc: OscillatorNode|null = null
  engineGain: GainNode|null = null

  startEngine() {
    if(this.engineOsc) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = 80
    osc.connect(g); g.connect(this.sfxGain)
    g.gain.value = 0.15
    osc.start()
    this.engineOsc = osc
    this.engineGain = g
  }

  updateEngine(speed: number, maxSpeed: number, accelerating: boolean) {
    if(!this.engineOsc || !this.engineGain) return
    const ratio = Math.max(0, Math.min(1, speed/maxSpeed))
    let targetFreq: number
    let targetVol: number
    if(ratio < 0.05) {
      targetFreq = 52 + Math.sin(Date.now()*0.003)*4
      targetVol = 0.06
    } else if(accelerating && ratio < 0.6) {
      targetFreq = 80 + ratio*260
      targetVol = 0.10 + ratio*0.14
    } else if(ratio >= 0.8) {
      targetFreq = 280 + ratio*120
      targetVol = 0.20 + ratio*0.08
    } else if(!accelerating && ratio > 0.1) {
      targetFreq = 60 + ratio*100
      targetVol = 0.05 + ratio*0.08
      if(Math.random() < 0.03) {
        const crackle = this.ctx.createOscillator()
        const cg = this.ctx.createGain()
        crackle.type = 'square'
        crackle.frequency.value = 80 + Math.random()*40
        cg.gain.setValueAtTime(0.08, this.ctx.currentTime)
        cg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.05)
        crackle.connect(cg); cg.connect(this.sfxGain)
        crackle.start(); crackle.stop(this.ctx.currentTime+0.05)
      }
    } else {
      targetFreq = 80 + ratio*200
      targetVol = 0.08 + ratio*0.12
    }
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08)
    this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.08)
  }

  stopEngine() {
    if(this.engineOsc){ this.engineOsc.stop(); this.engineOsc=null; this.engineGain=null }
  }

  startBg() {
    if (this.bgPlaying) return
    this.bgPlaying = true
    const bpm = 128, bar = (60/bpm)*4

    const bass = () => {
      const osc = this.ctx.createOscillator()
      const g   = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.connect(g); g.connect(this.bgGain)
      const notes = [55, 55, 65.4, 55, 49, 55, 61.7, 55]
      let t = this.ctx.currentTime
      notes.forEach(f => {
        osc.frequency.setValueAtTime(f, t)
        g.gain.setValueAtTime(0.6, t)
        g.gain.exponentialRampToValueAtTime(0.3, t + bar/8 - 0.01)
        t += bar/8
      })
      osc.start(); osc.stop(this.ctx.currentTime + bar)
      if (this.bgPlaying) setTimeout(bass, bar * 1000)
    }

    const pad = () => {
      [220, 277.2, 329.6].forEach(f => {
        const osc = this.ctx.createOscillator()
        const g   = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = f
        osc.connect(g); g.connect(this.bgGain)
        g.gain.setValueAtTime(0, this.ctx.currentTime)
        g.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.5)
        g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + bar * 2 - 0.2)
        osc.start(); osc.stop(this.ctx.currentTime + bar * 2)
      })
      if (this.bgPlaying) setTimeout(pad, bar * 2000)
    }

    const hat = () => {
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i/d.length)
      const src = this.ctx.createBufferSource()
      const g = this.ctx.createGain()
      src.buffer = buf; src.connect(g); g.connect(this.bgGain)
      g.gain.value = 0.15
      src.start()
      if (this.bgPlaying) setTimeout(hat, (bar/4) * 1000)
    }

    const bird = () => {
      if (!this.bgPlaying) return
      const osc = this.ctx.createOscillator()
      const g   = this.ctx.createGain()
      osc.type = 'sine'
      const base = 1800 + Math.random() * 800
      osc.frequency.setValueAtTime(base, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(base * 1.4, this.ctx.currentTime + 0.06)
      osc.frequency.exponentialRampToValueAtTime(base * 0.9, this.ctx.currentTime + 0.12)
      g.gain.setValueAtTime(0, this.ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15)
      osc.connect(g); g.connect(this.bgGain)
      osc.start(); osc.stop(this.ctx.currentTime + 0.2)
      const next = 1500 + Math.random() * 4000
      if (this.bgPlaying) setTimeout(bird, next)
    }

    const wind = () => {
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.05
      const src  = this.ctx.createBufferSource()
      const filt = this.ctx.createBiquadFilter()
      const g    = this.ctx.createGain()
      filt.type = 'lowpass'; filt.frequency.value = 180
      src.buffer = buf
      src.connect(filt); filt.connect(g); g.connect(this.bgGain)
      g.gain.value = 0.4; src.start()
      if (this.bgPlaying) setTimeout(wind, 1800)
    }

    bass(); pad(); hat(); bird(); wind()
  }

  stopBg() { this.bgPlaying = false }

  sfx(type: 'shoot'|'hit'|'coin'|'die'|'obstacle'|'thunder'|'nitro'|'plane'|'rocket') {
    try {
      const c = this.ctx
      if (type === 'shoot') {
        const o = c.createOscillator(), g = c.createGain()
        o.type = 'square'
        o.frequency.setValueAtTime(1200, c.currentTime)
        o.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.06)
        g.gain.setValueAtTime(0.2, c.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07)
        o.connect(g); g.connect(this.sfxGain); o.start(); o.stop(c.currentTime + 0.07)
      } else if (type === 'hit') {
        const o = c.createOscillator(), g = c.createGain()
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(300, c.currentTime)
        o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.25)
        g.gain.setValueAtTime(0.4, c.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25)
        o.connect(g); g.connect(this.sfxGain); o.start(); o.stop(c.currentTime + 0.25)
      } else if (type === 'coin') {
        const o = c.createOscillator(), g = c.createGain()
        o.type = 'sine'
        o.frequency.setValueAtTime(880, c.currentTime)
        o.frequency.exponentialRampToValueAtTime(1760, c.currentTime + 0.1)
        g.gain.setValueAtTime(0.25, c.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12)
        o.connect(g); g.connect(this.sfxGain); o.start(); o.stop(c.currentTime + 0.12)
      } else if (type === 'die') {
        const o = c.createOscillator(), g = c.createGain()
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(440, c.currentTime)
        o.frequency.exponentialRampToValueAtTime(27, c.currentTime + 0.8)
        g.gain.setValueAtTime(0.5, c.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8)
        o.connect(g); g.connect(this.sfxGain); o.start(); o.stop(c.currentTime + 0.8)
      } else if (type === 'obstacle') {
        const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(c.sampleRate*0.1))
        const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain()
        f.type = 'lowpass'; f.frequency.value = 600
        src.buffer = buf; src.connect(f); f.connect(g); g.connect(this.sfxGain)
        g.gain.value = 0.6; src.start()
      } else if (type === 'thunder') {
        const buf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(c.sampleRate*0.05))
        const src = c.createBufferSource(), g = c.createGain()
        src.buffer = buf; src.connect(g); g.connect(this.sfxGain)
        g.gain.value = 0.7; src.start()
      } else if (type === 'plane') {
        // Jet engine whoosh
        const buf = c.createBuffer(1, c.sampleRate * 1.2, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(c.sampleRate*0.4))
        const src = c.createBufferSource()
        const filt = c.createBiquadFilter()
        const g = c.createGain()
        filt.type = 'bandpass'; filt.frequency.value = 1200; filt.Q.value = 0.8
        src.buffer = buf; src.connect(filt); filt.connect(g); g.connect(this.sfxGain)
        g.gain.setValueAtTime(0, c.currentTime)
        g.gain.linearRampToValueAtTime(0.5, c.currentTime + 0.3)
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2)
        src.start()
      } else if (type === 'rocket') {
        // Rocket launch whistle + boom
        const o = c.createOscillator(), g = c.createGain()
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(800, c.currentTime)
        o.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.6)
        g.gain.setValueAtTime(0.35, c.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6)
        o.connect(g); g.connect(this.sfxGain); o.start(); o.stop(c.currentTime + 0.6)
      }
    } catch(_){}
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Game() {
  const gameRef      = useRef<Phaser.Game|null>(null)
  const touchInput    = useRef<{left:boolean,right:boolean,pause:boolean}>({left:false,right:false,pause:false})
  const audioRef     = useRef<AudioEngine|null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selChar, setSelChar] = useState(0)
  const [selCar,  setSelCar]  = useState(0)
  const [started, setStarted] = useState(false)
  const [score,   setScore]   = useState(0)
  const [coins,   setCoins]   = useState(0)

  const stopGame = () => {
    audioRef.current?.stopBg()
    gameRef.current?.destroy(true)
    gameRef.current = null
    setStarted(false)
  }

  useEffect(() => () => { stopGame() }, [])

  useEffect(() => {
    if (!started || !containerRef.current) return
    if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null }

    if (!audioRef.current) audioRef.current = new AudioEngine()
    audioRef.current.startBg()

    const char     = CHARACTERS[selChar]
    const upg = (() => { try { return JSON.parse(localStorage.getItem('upgradeLevels') || '{}') } catch { return {} } })()
    const upgLv = (id:number) => upg[id] || 0
    const speedBonus     = 1 + upgLv(1) * 0.15
    const rapidFireBonus = 1 - upgLv(16) * 0.10
    const warHeadBonus   = 1 + upgLv(17) * 0.20
    const magnetRange    = 100 + upgLv(21) * 50
    const doubleCoinsUpg = upgLv(22) >= 1; void doubleCoinsUpg
    const extraLives     = upgLv(25)
    const hasSecondWind  = upgLv(26) >= 1; void hasSecondWind
    const twinShotLv     = upgLv(18)
    const shieldGenLv    = upgLv(11)
    const savedCar = parseInt(localStorage.getItem('selCar') || '0')
    const car      = CARS[savedCar] || CARS[0]
    const carStats = { turbo: (car as any).turbo||1.3, armor: (car as any).armor||1.0, weight: (car as any).weight||1.0, neon: (car as any).neon||'#FFD700' }
    const coinMult = parseFloat(char.coins.replace('x',''))
    const audio    = audioRef.current

    class GameScene extends Phaser.Scene {
      player!: Phaser.GameObjects.Container
      bullets!: Phaser.GameObjects.Group
      enemies!: Phaser.GameObjects.Group
      enemyLasers!: Phaser.GameObjects.Group
      obstacles!: Phaser.GameObjects.Group
      coinGroup!: Phaser.GameObjects.Group
      airplaneGroup!: Phaser.GameObjects.Group   // ── NOU: avioane
      airplaneBombs!: Phaser.GameObjects.Group   // ── NOU: bombe/rachete din avion
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys
      wasd!: any
      keyN!: Phaser.Input.Keyboard.Key           // ── FIX: keyN ca proprietate
      score = 0; lives = 5; coinsCount = 0; secondWindUsed = false
      scoreText!: Phaser.GameObjects.Text
      livesText!: Phaser.GameObjects.Text
      coinsText!: Phaser.GameObjects.Text
      levelText!: Phaser.GameObjects.Text
      gameOverFlag = false
      paused = false
      shootTimer=0; enemyTimer=0; coinTimer=0; obstTimer=0; laserTimer=0
      supplyTimer=0
      airplaneTimer=0                            // ── NOU: timer avion
      shield=false; shieldGfx:any=null
      magnet=false; magnetTimer=0
      doubleScore=false; doubleTimer=0
      combo=0; comboTimer=0; comboText:any=null
      nitroActive=false; nitroTimer=0; nitroCooldown=0
      fuel=100; fuelTimer=0
      engSpeed=0; maxEngSpeed=100; isAccel=false
      streak=0
      birdTimer=0; lightningTimer=0
      playerLane=2
      lanes=[90,210,330,450,570]
      level=1; levelThreshold=200
      levelConfig: any = {}
      speedMult = 1
      motoMult = 1
      togglePause: () => void = () => {}
      roadLines: Phaser.GameObjects.Rectangle[] = []

      constructor() { super('GameScene') }

      preload() {
        const coinFiles=[
          ['coin1','coin moto.png.jpeg'],
          ['coin2','moto racer.png.jpg'],
          ['coin3','moto racer v3.png.jpeg'],
          ['coin4','moto v1.png.jpeg'],
          ['coin5','moto v4.png.jpeg'],
          ['coin6','moto1.png.jpeg'],
          ['coin7','motocoinv2.png.jpeg'],
          ['coin8','truckcoin.png.jpeg'],
        ]
        coinFiles.forEach(([key,file])=>this.load.image(key,`/coins/${encodeURIComponent(file)}`))
        try {
          const _lc = JSON.parse(localStorage.getItem('activeLevel') || '{}')
          if (_lc?.img) {
            const parts = _lc.img.split('/')
            const encoded = parts.map((p: string, i: number) => i === parts.length-1 ? encodeURIComponent(p) : p).join('/')
            console.log('[Game] Loading levelBg:', encoded)
            this.load.image('levelBg', encoded)
          }
        } catch(e) { console.warn('preload level img error', e) }
        this.load.image('car', `/cars/${car.img}`)
        console.log('[Game] Loading car:', car.img, 'index:', selCar)
        const allCars = ['lambo','jeep','moto','motoo','police','body']
        allCars.forEach(n => { try { this.load.image(`car_${n}`, `/cars/${n}.png.jpg`) } catch{} })
        this.load.image('char', `/characters/${char.img}`)
        ENEMY_IMGS.forEach(e => {
          this.load.image(`enemy_${e.key}`, `/enemies/${e.key}.PNG.${e.ext}`)
        })
        OBSTACLE_IMGS.forEach(o => this.load.image(o.key, `/obstacles/${o.file}`))
        this.load.image('supply1', '/obstacles/suplay.png.jpeg')
        this.load.image('supply2', '/obstacles/suplay2.png.jpeg')
        this.load.image('parasuta', '/obstacles/parasuta.jpeg')
        this.load.image('body', '/cars/body.jpeg')
        this.load.image('wheel_fl', '/cars/wheel_fl.jpeg')
        this.load.image('wheel_fr', '/cars/wheel_fr.jpeg')
        this.load.image('wheel_rl', '/cars/wheel_rl.jpeg')
        this.load.image('wheel_rr', '/cars/wheel_rr.jpeg')
        this.load.image('machinegun', '/obstacles/machinegun.png.jpg')
        this.load.image('laser_gun', '/obstacles/laser.png.jpg')
        this.load.image('rocket_gun', '/obstacles/rocket.png.jpg')
        this.load.image('plasma_gun', '/obstacles/plasma.png.jpg')
        // ── NOU: imaginea avionului - plain.png.jpg din folderul /plain/ ──
        this.load.image('airplane', '/plain/plain.png.jpg')
      }

      create() {
        try {
          const lc = JSON.parse(localStorage.getItem('activeLevel') || '{}')
          if (lc && lc.id) {
            this.levelConfig = lc
            this.speedMult = lc.mult || 1
            this.motoMult = lc.moto || 1
          }
        } catch(_) {}
        const W=this.scale.width, H=this.scale.height

        const bg=this.add.graphics()
        bg.fillGradientStyle(0x000000,0x000000,0x030A05,0x030A05,1)
        bg.fillRect(0,0,W,H)
        if (this.textures.exists('levelBg')) {
          const bgImg=this.add.image(W/2,H*0.32,'levelBg')
          bgImg.setDisplaySize(W,H*0.7)
          bgImg.setAlpha(0.35).setDepth(-1)
        }
        for(let i=0;i<60;i++){
          const sx=Phaser.Math.Between(0,W), sy=Phaser.Math.Between(70,H*0.5)
          const star=this.add.circle(sx,sy,Math.random()<0.3?1.5:0.8,0xFFFFFF,0.4+Math.random()*0.5)
          this.tweens.add({targets:star,alpha:{from:0.2,to:0.9},duration:800+Math.random()*2000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
        }

        const road=this.add.graphics()
        road.fillStyle(0x080F14,1)
        road.fillRect(40,0,W-80,H)
        road.fillGradientStyle(0x39FF14,0x39FF14,0x003300,0x003300,0.04,0.04,0,0)
        road.fillRect(40,0,15,H)
        road.fillGradientStyle(0x003300,0x003300,0x39FF14,0x39FF14,0,0,0.04,0.04)
        road.fillRect(W-55,0,15,H)

        const gl=this.add.graphics()
        gl.lineStyle(2,0x39FF14,0.6); gl.strokeRect(40,0,W-80,H)
        gl.lineStyle(1,0x004400,0.3); gl.beginPath(); gl.moveTo(42,0); gl.lineTo(42,H); gl.strokePath()
        gl.moveTo(W-42,0); gl.lineTo(W-42,H); gl.strokePath()

        for(let lane=1;lane<5;lane++){
          const lx=40+lane*((W-80)/5)
          for(let y=-60;y<H+60;y+=60){
            const r=this.add.rectangle(lx,y,2,32,0x39FF14,0.2)
            this.roadLines.push(r)
            this.tweens.add({targets:r,y:`+=${H+60}`,duration:1000,repeat:-1,ease:'Linear',delay:(y/60)*166})
          }
        }

        this.player = this.add.container(this.lanes[this.playerLane], H-90)
        const underGlow=this.add.ellipse(0,48,100,22,0x39FF14,0.3)
        const underGlow2=this.add.ellipse(0,48,80,14,0xC8960C,0.4)
        const bodyImg = this.add.image(0, 0, 'body')
        bodyImg.setDisplaySize(78, 118)
        const holoGfx=this.add.graphics()
        const neonCol = parseInt((carStats.neon||'#00EAFF').replace('#',''),16)
        holoGfx.lineStyle(2,neonCol,0.35); holoGfx.strokeRect(-40,-60,80,120)
        holoGfx.lineStyle(1,0xa259ff,0.2); holoGfx.strokeRect(-35,-55,70,110)
        holoGfx.lineStyle(1,neonCol,0.15); holoGfx.strokeRect(-30,-50,60,100)
        holoGfx.lineStyle(1,0xFFD700,0.15); holoGfx.strokeRect(-30,-50,60,100)
        const engGlow=this.add.circle(0,56,16,0x39FF14,0.8)
        const engGlow2=this.add.circle(0,56,24,0x00FF00,0.2)
        this.tweens.add({targets:engGlow,alpha:{from:0.4,to:1},scaleX:{from:0.7,to:1.2},scaleY:{from:0.7,to:1.2},duration:150,yoyo:true,repeat:-1})
        this.tweens.add({targets:engGlow2,alpha:{from:0.1,to:0.4},scaleX:{from:0.8,to:1.4},duration:300,yoyo:true,repeat:-1})
        const spd=this.add.graphics()
        spd.lineStyle(2,0xFFD700,0.7); spd.beginPath()
        spd.moveTo(-18,-62); spd.lineTo(-18,-88)
        spd.moveTo(18,-62); spd.lineTo(18,-88)
        spd.strokePath()
        spd.lineStyle(1,0x39FF14,0.5); spd.beginPath()
        spd.moveTo(-8,-62); spd.lineTo(-8,-95)
        spd.moveTo(8,-62); spd.lineTo(8,-95)
        spd.moveTo(0,-62); spd.lineTo(0,-98)
        spd.strokePath()
        const corners=this.add.graphics()
        corners.lineStyle(2,0xC8960C,0.9)
        corners.beginPath()
        corners.moveTo(-40,-40); corners.lineTo(-40,-60); corners.lineTo(-20,-60)
        corners.moveTo(40,-40); corners.lineTo(40,-60); corners.lineTo(20,-60)
        corners.moveTo(-40,40); corners.lineTo(-40,60); corners.lineTo(-20,60)
        corners.moveTo(40,40); corners.lineTo(40,60); corners.lineTo(20,60)
        corners.strokePath()
        const sh1=this.add.circle(-30,-30,3,0xa259ff,0.8)
        const sh2=this.add.circle(30,-30,3,0x00eaff,0.7)
        const sh3=this.add.circle(-30,30,3,0xff6ec7,0.6)
        const sh4=this.add.circle(30,30,3,0xFFE566,0.7)
        this.tweens.add({targets:[sh1,sh2,sh3,sh4],alpha:{from:0.2,to:1},duration:600+Math.random()*400,yoyo:true,repeat:-1})
        const gunImg = this.add.image(0, -60, 'machinegun')
        gunImg.setDisplaySize(20, 26)
        gunImg.setTint(0xFFD700)
        this.player.add([underGlow2,underGlow,bodyImg,holoGfx,corners,engGlow2,engGlow,spd,sh1,sh2,sh3,sh4,gunImg])
        this.lives = 3 + extraLives
        if(shieldGenLv > 0) { this.shield = true; this.activateShield() }

        const cpx=W-48, cpy=H-70
        const cpBg=this.add.graphics()
        cpBg.fillStyle(0x050A0E,0.95); cpBg.fillRect(cpx-38,cpy-50,76,90)
        cpBg.lineStyle(2,0xC8960C,0.9); cpBg.strokeRect(cpx-38,cpy-50,76,90)
        cpBg.lineStyle(1,0xa259ff,0.5); cpBg.strokeRect(cpx-35,cpy-47,70,84)
        cpBg.lineStyle(1,0x00EAFF,0.3); cpBg.strokeRect(cpx-32,cpy-44,64,78)
        const charPortrait=this.add.image(cpx,cpy,'char').setDisplaySize(66,82)
        this.tweens.add({targets:charPortrait,tint:{from:0xFFFFFF,to:0xa259ff},duration:2000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
        this.add.text(cpx,cpy+50,char.name.split(' ')[0],{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'#00EAFF'}).setOrigin(0.5)

        // Groups
        this.bullets     = this.add.group()
        this.enemies     = this.add.group()
        this.enemyLasers = this.add.group()
        this.obstacles   = this.add.group()
        this.coinGroup   = this.add.group()
        this.airplaneGroup = this.add.group()   // ── NOU
        this.airplaneBombs = this.add.group()  // ── NOU

        // ── FIX: Controls - keyN creat o singura data in create() ──
        this.cursors=this.input.keyboard!.createCursorKeys()
        this.wasd=this.input.keyboard!.addKeys('W,A,S,D')
        this.keyN=this.input.keyboard!.addKey('N')  // ── FIX

        const hud=this.add.graphics()
        hud.fillStyle(0x000000,0.88); hud.fillRect(0,0,W,70)
        hud.lineStyle(1,0xC8960C,0.6); hud.strokeRect(0,0,W,70)
        hud.lineStyle(1,0x39FF14,0.2); hud.strokeRect(2,2,W-4,66)

        const ts={fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#FFD700'}
        this.scoreText=this.add.text(10,8,'SCORE: 0',ts)
        this.livesText=this.add.text(10,26,'❤ ❤ ❤',{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#FF2244'})
        this.coinsText=this.add.text(10,48,'COINS: 0',{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#FFD700'})
        const pauseBtn=this.add.text(W-10,10,'⏸ PAUSE',{
          fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#FFD700',
          backgroundColor:'#050A0E',padding:{x:8,y:4}
        }).setOrigin(1,0).setDepth(100).setInteractive({useHandCursor:true})
        const pauseOverlay=this.add.rectangle(W/2,H/2,W,H,0x000000,0.7).setDepth(99).setVisible(false)
        const pauseText=this.add.text(W/2,H/2,'⏸ PAUSED\nClick RESUME to continue',{
          fontFamily:'Orbitron,monospace',fontSize:'18px',color:'#FFD700',
          align:'center',stroke:'#000',strokeThickness:4
        }).setOrigin(0.5).setDepth(100).setVisible(false)
        const resumeBtn=this.add.text(W/2,H/2+60,'▶ RESUME',{
          fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#39FF14',
          backgroundColor:'#050A0E',padding:{x:16,y:8}
        }).setOrigin(0.5).setDepth(100).setVisible(false).setInteractive({useHandCursor:true})
        this.togglePause=()=>{
          this.paused=!this.paused
          pauseOverlay.setVisible(this.paused)
          pauseText.setVisible(this.paused)
          resumeBtn.setVisible(this.paused)
          pauseBtn.setText(this.paused?'▶ PLAY':'⏸ PAUSE')
          if(this.paused) this.physics.pause()
          else this.physics.resume()
        }
        pauseBtn.on('pointerdown',this.togglePause)
        resumeBtn.on('pointerdown',this.togglePause)
        this.input.keyboard!.on('keydown-P',this.togglePause)
        this.add.text(W/2,6,char.name,{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#00EAFF'}).setOrigin(0.5,0)
        this.add.text(W/2,20,`BONUS ${char.coins}`,{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#39FF14'}).setOrigin(0.5,0)
        const lvName=this.levelConfig?.name?`${this.levelConfig.name} · LV1`:'LEVEL 1'
        this.levelText=this.add.text(W/2,36,lvName,{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#a259ff'}).setOrigin(0.5,0)
        const nitroLabel=this.add.text(8,H-38,'NITRO',{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'#00EAFF'}).setDepth(10)
        void nitroLabel
        this.add.rectangle(90,H-32,160,10,0x050A0E,0.9).setDepth(10).setStrokeStyle(1,0x00EAFF,0.6)
        ;(this as any).nitroBar=this.add.rectangle(12,H-32,0,8,0x00EAFF,1).setDepth(10).setOrigin(0,0.5)
        const fuelLabel=this.add.text(8,H-20,'FUEL',{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'#FFD700'}).setDepth(10)
        void fuelLabel
        this.add.rectangle(90,H-14,160,10,0x050A0E,0.9).setDepth(10).setStrokeStyle(1,0xFFD700,0.6)
        ;(this as any).fuelBar=this.add.rectangle(12,H-14,160,8,0xFFD700,1).setDepth(10).setOrigin(0,0.5)
        this.add.text(W-8,56,'N = NITRO',{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'rgba(0,234,255,0.4)'}).setOrigin(1,0).setDepth(10)
        this.add.text(W-8,8,'MOTO RUNNER',{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#BF5FFF'}).setOrigin(1,0)
        this.add.text(W-8,24,'← → MOVE',{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'rgba(255,215,0,0.3)'}).setOrigin(1,0)
        this.add.text(W-8,40,'AUTO FIRE',{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'rgba(57,255,20,0.3)'}).setOrigin(1,0)
        this.add.text(W-8,52,'↑↓ SPEED',{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'rgba(0,234,255,0.3)'}).setOrigin(1,0)
      }

      // ── Explosion ────────────────────────────────────────────────────────────
      spawnExplosion(x:number, y:number) {
        audio.sfx('obstacle')
        audio.sfx('thunder')
        for(let i=0;i<8;i++){
          const angle=(i/8)*Math.PI*2
          const len=30+Phaser.Math.Between(10,40)
          const col=EXPLODE_COLORS[Phaser.Math.Between(0,EXPLODE_COLORS.length-1)]
          const gfx=this.add.graphics()
          gfx.lineStyle(2,col,1)
          let cx2=x, cy2=y
          for(let seg=0;seg<4;seg++){
            const nx=cx2+Math.cos(angle)*(len/4)+Phaser.Math.Between(-8,8)
            const ny=cy2+Math.sin(angle)*(len/4)+Phaser.Math.Between(-8,8)
            gfx.beginPath(); gfx.moveTo(cx2,cy2); gfx.lineTo(nx,ny); gfx.strokePath()
            cx2=nx; cy2=ny
          }
          this.tweens.add({targets:gfx,alpha:0,duration:350+Phaser.Math.Between(0,200),onComplete:()=>gfx.destroy()})
        }
        const flash=this.add.circle(x,y,40,0xFFFFFF,0.9)
        this.tweens.add({targets:flash,alpha:0,scaleX:3,scaleY:3,duration:200,onComplete:()=>flash.destroy()})
        const ring=this.add.circle(x,y,10,0x39FF14,0)
        ring.setStrokeStyle(3,0x39FF14,0.9)
        this.tweens.add({targets:ring,scaleX:5,scaleY:5,alpha:0,duration:400,onComplete:()=>ring.destroy()})
        const numCoins=Phaser.Math.Between(3,7)
        for(let i=0;i<numCoins;i++){
          const col=COIN_COLORS[Phaser.Math.Between(0,COIN_COLORS.length-1)]
          const coinGfx=this.add.graphics()
          coinGfx.fillStyle(col,1); coinGfx.fillCircle(0,0,6)
          coinGfx.fillStyle(0xFFE566,0.7); coinGfx.fillCircle(-2,-2,3)
          const container=this.add.container(x,y,[coinGfx])
          const vx=(Math.random()-0.5)*120
          const vy=-80-Math.random()*60
          this.tweens.add({
            targets:container, x:x+vx, y:y+vy+80,
            alpha:0, duration:900, ease:'Power2',
            onComplete:()=>container.destroy()
          })
          const val=Phaser.Math.Between(2,8)
          const ct=this.add.text(x+vx*0.5,y-30,`+${val}`,{fontFamily:'Orbitron,monospace',fontSize:'9px',color:`#${col.toString(16).padStart(6,'0')}`})
          this.tweens.add({targets:ct,y:ct.y-40,alpha:0,duration:900,onComplete:()=>ct.destroy()})
        }
        this.cameras.main.shake(300,0.02)
      }

      // ── NOU: Spawn avion care traverseaza ecranul si lanseaza rachete/torpile ──
      spawnAirplane() {
        const W = this.scale.width
        const H = this.scale.height
        // Avionul apare din stanga sau dreapta, zboara la inaltime mica (sub HUD)
        const fromLeft = Phaser.Math.Between(0,1) === 0
        const yPos = Phaser.Math.Between(85, 160) // sus, sub HUD
        const startX = fromLeft ? -120 : W + 120
        const endX   = fromLeft ? W + 120 : -120
        const facingRight = fromLeft

        const planeContainer = this.add.container(startX, yPos)

        // Verific daca imaginea e incarcata
        const imgKey = this.textures.exists('airplane') ? 'airplane' : null

        if (imgKey) {
          // Imaginea reala din /plain/
          const planeImg = this.add.image(0, 0, imgKey)
          planeImg.setDisplaySize(110, 50)
          if (!facingRight) planeImg.setFlipX(true)
          planeContainer.add(planeImg)
        } else {
          // Fallback: avion desenat procedural (daca imaginea nu exista)
          const pg = this.add.graphics()
          // Fuselaj
          pg.fillStyle(0x888888, 1)
          pg.fillEllipse(0, 0, 90, 22)
          // Aripi
          pg.fillStyle(0xAAAAAA, 1)
          pg.fillTriangle(-10, -2, 30, -28, 30, 2)  // aripa stanga sus
          pg.fillTriangle(-10, 2, 30, 28, 30, -2)   // aripa dreapta jos
          // Coada
          pg.fillStyle(0x666666, 1)
          pg.fillTriangle(-45, 0, -30, -18, -30, 0)
          // Cabina - geam
          pg.fillStyle(0x00EAFF, 0.8)
          pg.fillEllipse(22, 0, 22, 12)
          // Neon outline
          pg.lineStyle(2, 0xFFD700, 0.9)
          pg.strokeEllipse(0, 0, 90, 22)
          if (!facingRight) pg.scaleX = -1
          planeContainer.add(pg)
        }

        // Trail/exhaust din motoare
        const exhaust = this.add.graphics()
        exhaust.fillStyle(0xFF6600, 0.6)
        const exX = facingRight ? -55 : 55
        exhaust.fillEllipse(exX, 0, 20, 8)
        planeContainer.add(exhaust)
        this.tweens.add({targets: exhaust, alpha:{from:0.3,to:0.8}, scaleX:{from:0.5,to:1.5}, duration:80, yoyo:true, repeat:-1})

        // Glow rosu sub avion - semnal pericol
        const dangerGlow = this.add.graphics()
        dangerGlow.lineStyle(2, 0xFF2244, 0.7)
        dangerGlow.strokeEllipse(0, 0, 100, 40)
        planeContainer.add(dangerGlow)
        this.tweens.add({targets: dangerGlow, alpha:{from:0.2,to:0.9}, duration:200, yoyo:true, repeat:-1})

        // Viteza avion
        const speed = 280 + this.level * 20
        const travelTime = (W + 240) / speed * 1000

        ;(planeContainer as any).isAirplane = true
        ;(planeContainer as any).facingRight = facingRight
        ;(planeContainer as any).bombsDropped = 0
        ;(planeContainer as any).maxBombs = Phaser.Math.Between(2, 4)
        ;(planeContainer as any).bombInterval = Phaser.Math.Between(400, 900)
        ;(planeContainer as any).bombTimer = 0
        ;(planeContainer as any).active = true

        this.airplaneGroup.add(planeContainer)
        audio.sfx('plane')

        // Mesaj warning
        const warnTxt = this.add.text(
          this.scale.width/2, 78,
          '⚠ AIR STRIKE INCOMING ⚠',
          {fontFamily:'Orbitron,monospace', fontSize:'10px', color:'#FF2244', stroke:'#000', strokeThickness:2}
        ).setOrigin(0.5).setDepth(20)
        this.tweens.add({targets:warnTxt, alpha:{from:0,to:1}, duration:150, yoyo:true, repeat:5,
          onComplete:()=>warnTxt.destroy()})

        // Tween zbor
        this.tweens.add({
          targets: planeContainer,
          x: endX,
          duration: travelTime,
          ease: 'Linear',
          onComplete: () => { planeContainer.destroy() }
        })
      }

      // ── NOU: Spawn bomba/racheta din avion ──
      spawnAirplaneBomb(planeX: number, planeY: number) {
        const W = this.scale.width
        // Bomba cade pe un lane random sau spre jucator
        const targetLane = Phaser.Math.Between(0, 4)
        const targetX = this.lanes[targetLane]

        // Tip random: 0=racheta, 1=torpila, 2=bomba simpla
        const bombType = Phaser.Math.Between(0, 2)

        const bombContainer = this.add.container(planeX, planeY)

        if (bombType === 0) {
          // RACHETA - corp alungit cu foc la coada
          const rg = this.add.graphics()
          rg.fillStyle(0xFF4400, 1); rg.fillEllipse(0, 0, 10, 28)
          rg.fillStyle(0xFFD700, 1); rg.fillTriangle(-5, -14, 5, -14, 0, -22)
          rg.lineStyle(1, 0xFF2244, 0.8); rg.strokeEllipse(0, 0, 10, 28)
          const fire = this.add.circle(0, 14, 5, 0xFF6600, 0.9)
          const fire2 = this.add.circle(0, 18, 3, 0xFFFF00, 0.7)
          bombContainer.add([rg, fire, fire2])
          this.tweens.add({targets:[fire,fire2], scaleX:{from:0.5,to:1.5}, scaleY:{from:0.5,to:2}, alpha:{from:0.5,to:1}, duration:60, yoyo:true, repeat:-1})
          ;(bombContainer as any).bombLabel = 'ROCKET'
        } else if (bombType === 1) {
          // TORPILA - corp argintiu cu elice
          const tg = this.add.graphics()
          tg.fillStyle(0xAAAAAA, 1); tg.fillEllipse(0, 0, 14, 34)
          tg.fillStyle(0x888888, 1); tg.fillTriangle(-7, -17, 7, -17, 0, -26)
          tg.lineStyle(1, 0x00EAFF, 0.7); tg.strokeEllipse(0, 0, 14, 34)
          // Elice (spinner)
          const elice = this.add.graphics()
          elice.lineStyle(2, 0x00EAFF, 0.9)
          elice.beginPath(); elice.moveTo(-8, 17); elice.lineTo(8, 17); elice.strokePath()
          elice.beginPath(); elice.moveTo(0, 10); elice.lineTo(0, 24); elice.strokePath()
          bombContainer.add([tg, elice])
          this.tweens.add({targets:elice, angle:360, duration:200, repeat:-1, ease:'Linear'})
          ;(bombContainer as any).bombLabel = 'TORPEDO'
        } else {
          // BOMBA SIMPLA - sfera cu countdown
          const bg2 = this.add.circle(0, 0, 12, 0x222222, 1)
          bg2.setStrokeStyle(2, 0xFF2244, 0.9)
          const fuse = this.add.graphics()
          fuse.lineStyle(2, 0xFFD700, 0.9); fuse.beginPath(); fuse.moveTo(0,-12); fuse.lineTo(4,-22); fuse.strokePath()
          const sparkle = this.add.circle(4, -22, 3, 0xFFFF00, 0.9)
          bombContainer.add([bg2, fuse, sparkle])
          this.tweens.add({targets:sparkle, alpha:{from:0.2,to:1}, scaleX:{from:0.5,to:1.5}, duration:100, yoyo:true, repeat:-1})
          ;(bombContainer as any).bombLabel = 'BOMB'
        }

        // Arata tipul pe scurt
        const bombLbl = this.add.text(planeX, planeY - 20, (bombContainer as any).bombLabel||'', {
          fontFamily:'Orbitron,monospace', fontSize:'8px', color:'#FF2244'
        }).setOrigin(0.5).setDepth(15)
        this.tweens.add({targets:bombLbl, alpha:0, y:bombLbl.y-20, duration:600, onComplete:()=>bombLbl.destroy()})

        ;(bombContainer as any).speed = 4 + this.level * 0.3
        ;(bombContainer as any).targetX = targetX
        ;(bombContainer as any).isBomb = true
        this.airplaneBombs.add(bombContainer)
        audio.sfx('rocket')

        // Shadow indicator pe strada
        const shadow = this.add.ellipse(targetX, W/2, 30, 12, 0xFF2244, 0.3)
        shadow.setDepth(5)
        this.tweens.add({targets:shadow, alpha:{from:0.1,to:0.6}, scaleX:{from:0.5,to:1.2}, duration:200, yoyo:true, repeat:8, onComplete:()=>shadow.destroy()})

        // Tween: cade spre targetX, accelerand
        this.tweens.add({
          targets: bombContainer,
          x: targetX,
          y: this.scale.height + 40,
          duration: 1200 - this.level * 30,
          ease: 'Quad.easeIn',
          onComplete: () => {
            // Explozie la impact cu strada (daca nu a lovit jucatorul)
            if (bombContainer.active) {
              this.spawnExplosion(bombContainer.x, bombContainer.y)
              bombContainer.destroy()
            }
          }
        })
      }

      // ── Enemy spawn ──────────────────────────────────────────────────────────
      spawnEnemy(lane:number) {
        const eData=ENEMY_IMGS[Phaser.Math.Between(0,ENEMY_IMGS.length-1)]
        const x=this.lanes[lane]
        const container=this.add.container(x,-60)
        const aura=this.add.graphics()
        const auraCol=LASER_COLORS[Phaser.Math.Between(0,LASER_COLORS.length-1)]
        aura.lineStyle(3,auraCol,0.8)
        const r=30
        aura.beginPath()
        for(let i=0;i<6;i++){
          const a=Math.PI/180*(60*i-30)
          i===0 ? aura.moveTo(Math.cos(a)*r,Math.sin(a)*r) : aura.lineTo(Math.cos(a)*r,Math.sin(a)*r)
        }
        aura.closePath(); aura.strokePath()
        const bg2=this.add.circle(0,0,22,0x050A0E,0.95)
        bg2.setStrokeStyle(1,auraCol,0.5)
        const logo=this.add.image(0,0,`enemy_${eData.key}`)
        logo.setDisplaySize(34,34)
        const scan=this.add.graphics()
        for(let sy=-17;sy<17;sy+=3){
          scan.lineStyle(1,0x000000,0.25)
          scan.beginPath(); scan.moveTo(-17,sy); scan.lineTo(17,sy); scan.strokePath()
        }
        const innerGlow=this.add.graphics()
        innerGlow.lineStyle(2,auraCol,0.4); innerGlow.strokeCircle(0,0,14)
        const es1=this.add.circle(-8,-8,3,0xa259ff,0.5)
        const es2=this.add.circle(8,8,2,0x00eaff,0.4)
        const es3=this.add.circle(8,-8,2,0xff6ec7,0.3)
        const highlight=this.add.circle(-10,-10,4,0xFFFFFF,0.15)
        const hp1=this.add.rectangle(-10,28,8,4,0x39FF14,0.9)
        const hp2=this.add.rectangle(2,28,8,4,0x39FF14,0.9)
        container.add([aura,bg2,logo,scan,innerGlow,es1,es2,es3,highlight,hp1,hp2])
        ;(container as any).hp=2
        ;(container as any).aura=aura
        ;(container as any).auraCol=auraCol
        ;(container as any).hp1=hp1
        ;(container as any).hp2=hp2
        ;(container as any).lane=lane
        this.tweens.add({targets:aura,angle:360,duration:2000+Math.random()*1000,repeat:-1,ease:'Linear'})
        this.tweens.add({targets:bg2,scaleX:{from:0.95,to:1.05},scaleY:{from:0.95,to:1.05},duration:600,yoyo:true,repeat:-1})
        this.enemies.add(container)
      }

      spawnObstacle(lane:number) {
        const oData=OBSTACLE_IMGS[Phaser.Math.Between(0,OBSTACLE_IMGS.length-1)]
        const x=this.lanes[lane]
        const container=this.add.container(x,-70)
        const glow=this.add.circle(0,0,32,0xFF2244,0)
        glow.setStrokeStyle(2,0xFF2244,0.6)
        const img=this.add.image(0,0,oData.key).setDisplaySize(48,48)
        const warn=this.add.triangle(0,-40, -8,0, 8,0, 0,-14, 0xFFD700,0.8)
        this.tweens.add({targets:warn,alpha:{from:0.2,to:1},duration:300,yoyo:true,repeat:-1})
        this.tweens.add({targets:img,angle:360,duration:4000,repeat:-1,ease:'Linear'})
        this.tweens.add({targets:glow,scaleX:{from:0.8,to:1.2},scaleY:{from:0.8,to:1.2},duration:500,yoyo:true,repeat:-1})
        container.add([glow,img,warn])
        ;(container as any).lane=lane
        this.obstacles.add(container)
      }

      spawnCoin(lane:number) {
        const x=this.lanes[lane]
        const container=this.add.container(x,-20)
        const coinKeys=['coin1','coin2','coin3','coin4','coin5','coin6','coin7','coin8']
        const ck=coinKeys[Phaser.Math.Between(0,coinKeys.length-1)]
        const glowRing=this.add.graphics()
        glowRing.lineStyle(4,0x39FF14,0.5); glowRing.strokeCircle(0,0,16)
        const glowRing2=this.add.graphics()
        glowRing2.lineStyle(2,0x00FF00,0.25); glowRing2.strokeCircle(0,0,22)
        const goldRing=this.add.graphics()
        goldRing.lineStyle(2,0xFFD700,0.9); goldRing.strokeCircle(0,0,13)
        const bgCircle=this.add.circle(0,0,12,0x050A0E,0.95)
        const img=this.add.image(0,0,ck)
        img.setDisplaySize(20,20)
        const sh1=this.add.circle(-5,-5,2,0xa259ff,0.7)
        const sh2=this.add.circle(4,4,1.5,0x00eaff,0.6)
        const sh3=this.add.circle(5,-3,1,0xff6ec7,0.5)
        container.add([glowRing2,glowRing,goldRing,bgCircle,img,sh1,sh2,sh3])
        ;(container as any).col=0xFFD700
        this.tweens.add({targets:glowRing,scaleX:{from:0.8,to:1.3},scaleY:{from:0.8,to:1.3},alpha:{from:0.3,to:0.9},duration:600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
        this.tweens.add({targets:img,angle:360,duration:1800,repeat:-1,ease:'Linear'})
        this.tweens.add({targets:[sh1,sh2,sh3],alpha:{from:0.2,to:1},duration:400+Math.random()*300,yoyo:true,repeat:-1})
        this.coinGroup.add(container)
      }

      spawnSupplyDrop() {
        const lane = Phaser.Math.Between(0, 4)
        const x = this.lanes[lane]
        const type = Phaser.Math.Between(0, 2)
        const colors = [0x39FF14, 0x00EAFF, 0xa259ff]
        const col = colors[type]
        const container = this.add.container(x, -80)
        const chuteImg = this.add.image(0, -45, 'parasuta')
        chuteImg.setDisplaySize(70, 65)
        const chuteGlow = this.add.graphics()
        chuteGlow.lineStyle(2, 0xFFD700, 0.6); chuteGlow.strokeEllipse(0, -45, 72, 50)
        const chuteGfx = this.add.graphics()
        chuteGfx.lineStyle(1, 0x39FF14, 0.8)
        chuteGfx.beginPath()
        chuteGfx.moveTo(-20, -20); chuteGfx.lineTo(0, 10)
        chuteGfx.moveTo(20, -20); chuteGfx.lineTo(0, 10)
        chuteGfx.moveTo(0, -18); chuteGfx.lineTo(0, 10)
        chuteGfx.strokePath()
        const boxBg = this.add.rectangle(0, 14, 28, 24, 0x050A0E, 0.95)
        boxBg.setStrokeStyle(2, col, 1)
        const corners = this.add.graphics()
        corners.lineStyle(2, 0xFFD700, 0.9)
        corners.beginPath()
        corners.moveTo(-14, -4); corners.lineTo(-14, -12); corners.lineTo(-6, -12)
        corners.moveTo(14, -4); corners.lineTo(14, -12); corners.lineTo(6, -12)
        corners.moveTo(-14, 32); corners.lineTo(-14, 26); corners.lineTo(-6, 26)
        corners.moveTo(14, 32); corners.lineTo(14, 26); corners.lineTo(6, 26)
        corners.strokePath()
        const imgKey = Phaser.Math.Between(0,1) === 0 ? 'supply1' : 'supply2'
        const supImg = this.add.image(0, 14, imgKey).setDisplaySize(22, 20)
        const glowRing = this.add.graphics()
        glowRing.lineStyle(3, col, 0.6); glowRing.strokeCircle(0, 14, 18)
        const sh1 = this.add.circle(-8, 8, 2, 0xa259ff, 0.7)
        const sh2 = this.add.circle(8, 8, 2, 0x00eaff, 0.6)
        const sh3 = this.add.circle(0, 20, 1.5, 0xff6ec7, 0.5)
        container.add([chuteImg, chuteGlow, chuteGfx, glowRing, boxBg, corners, supImg, sh1, sh2, sh3])
        ;(container as any).supplyType = type
        ;(container as any).isSupply = true
        this.tweens.add({targets: glowRing, scaleX:{from:0.8,to:1.3}, scaleY:{from:0.8,to:1.3}, alpha:{from:0.4,to:1}, duration:600, yoyo:true, repeat:-1})
        this.tweens.add({targets:[sh1,sh2,sh3], alpha:{from:0.2,to:1}, duration:400, yoyo:true, repeat:-1})
        this.tweens.add({targets: container, angle:{from:-5,to:5}, duration:1200, yoyo:true, repeat:-1, ease:'Sine.easeInOut'})
        this.obstacles.add(container)
      }

      activateShield() {
        if(this.shieldGfx) this.shieldGfx.destroy()
        const sg = this.add.graphics()
        sg.lineStyle(3, 0x00EAFF, 0.8); sg.strokeCircle(0, 0, 45)
        sg.lineStyle(1, 0xa259ff, 0.4); sg.strokeCircle(0, 0, 50)
        this.player.add(sg)
        this.shieldGfx = sg
        this.tweens.add({targets:sg, alpha:{from:0.5,to:1}, duration:400, yoyo:true, repeat:14,
          onComplete:()=>{ this.shield=false; sg.destroy(); this.shieldGfx=null }})
        audio.sfx('coin')
      }

      spawnSupplyEffect(x:number, y:number, type:number) {
        const cols=[0x39FF14,0x00EAFF,0xa259ff]
        const col=cols[type]
        for(let i=0;i<12;i++){
          const angle=Math.random()*Math.PI*2
          const speed=60+Math.random()*80
          const p=this.add.circle(x,y,3+Math.random()*4,col,0.9)
          this.tweens.add({targets:p,
            x:x+Math.cos(angle)*speed, y:y+Math.sin(angle)*speed,
            alpha:0, scaleX:0, scaleY:0, duration:500+Math.random()*300,
            onComplete:()=>p.destroy()})
        }
        const ring=this.add.graphics()
        ring.lineStyle(3,0xFFD700,0.9); ring.strokeCircle(x,y,10)
        this.tweens.add({targets:ring,scaleX:4,scaleY:4,alpha:0,duration:400,onComplete:()=>ring.destroy()})
      }

      update(_t:number, delta:number) {
        if (this.gameOverFlag) return
        if (this.paused) return
        const H=this.scale.height

        // Level progression
        const newLevel=Math.floor(this.score/this.levelThreshold)+1
        if(newLevel!==this.level){
          this.level=newLevel
          this.levelText.setText(`LEVEL ${this.level}`)
          this.levelText.setColor(this.level>5?'#FF6EC7':this.level>3?'#FF2244':'#a259ff')
          const lf=this.add.text(this.scale.width/2,this.scale.height/2,`LEVEL ${this.level}!`,{fontFamily:'Orbitron,monospace',fontSize:'28px',color:'#FFD700',stroke:'#000',strokeThickness:4}).setOrigin(0.5)
          this.tweens.add({targets:lf,y:lf.y-80,alpha:0,duration:1200,onComplete:()=>lf.destroy()})
        }

        // Player movement
        if(Phaser.Input.Keyboard.JustDown(this.cursors.left!)||Phaser.Input.Keyboard.JustDown(this.wasd.A)||touchInput.current.left){
          if(this.playerLane>0) this.playerLane--
          touchInput.current.left=false
        }
        if(Phaser.Input.Keyboard.JustDown(this.cursors.right!)||Phaser.Input.Keyboard.JustDown(this.wasd.D)||touchInput.current.right){
          if(this.playerLane<4) this.playerLane++
          touchInput.current.right=false
        }
        if(this.cursors.up?.isDown||this.wasd.W?.isDown){
          this.speedMult=Math.min(2.5, this.speedMult+0.02)
        }
        if(this.cursors.down?.isDown||this.wasd.S?.isDown){
          this.speedMult=Math.max(0.3, this.speedMult-0.02)
        }
        if(touchInput.current.pause){ touchInput.current.pause=false; this.togglePause() }

        // ── FIX: NITRO foloseste this.keyN (creat in create(), nu addKey in fiecare frame) ──
        if(Phaser.Input.Keyboard.JustDown(this.keyN) && this.nitroCooldown<=0 && !this.nitroActive){
          this.nitroActive=true; this.nitroTimer=3000; this.nitroCooldown=15000
          this.speedMult = carStats.turbo * 1.5
          audio.sfx('nitro')
          const nf=this.add.rectangle(this.player.x,this.player.y,90,130,0x00EAFF,0.3)
          this.tweens.add({targets:nf,alpha:0,scaleX:2,scaleY:2,duration:400,onComplete:()=>nf.destroy()})
        }
        this.player.x=Phaser.Math.Linear(this.player.x,this.lanes[this.playerLane],0.18)
        const dx = this.lanes[this.playerLane] - this.player.x
        const targetTilt = Math.max(-0.08, Math.min(0.08, dx * 0.004))
        this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetTilt, 0.12)

        // Auto shoot
        this.shootTimer+=delta
        const fireRate=Math.max(60,(220-this.level*20)*rapidFireBonus)
        if(this.shootTimer>fireRate){
          this.shootTimer=0
          audio.sfx('shoot')
          const col=LASER_COLORS[Phaser.Math.Between(0,LASER_COLORS.length-1)]
          const b=this.add.container(this.player.x,this.player.y-55)
          const bGfx=this.add.graphics()
          bGfx.fillStyle(0xFFE566,1); bGfx.fillEllipse(0,-16,6,10)
          bGfx.fillStyle(0xFFD700,1); bGfx.fillRect(-2,-12,5,14)
          bGfx.fillStyle(0xC8960C,1); bGfx.fillRect(-2,2,5,5)
          bGfx.fillStyle(0xB8860B,1); bGfx.fillRect(-1,7,3,3)
          const bTip=this.add.circle(0,-16,5,0x39FF14,0.9)
          const bTip2=this.add.circle(0,-16,8,0x00FF00,0.3)
          const bTrail=this.add.graphics()
          bTrail.lineStyle(3,0x00EAFF,0.5); bTrail.beginPath(); bTrail.moveTo(0,0); bTrail.lineTo(0,20); bTrail.strokePath()
          bTrail.lineStyle(1,0xFFD700,0.3); bTrail.beginPath(); bTrail.moveTo(0,0); bTrail.lineTo(0,28); bTrail.strokePath()
          b.add([bTrail,bGfx,bTip2,bTip]);(b as any).col=col;(b as any).dmg=Math.ceil(1*warHeadBonus)
          this.bullets.add(b)
          const burst=this.add.circle(this.player.x,this.player.y-55,8,col,0.5)
          this.tweens.add({targets:burst,alpha:0,scaleX:3,scaleY:3,duration:100,onComplete:()=>burst.destroy()})
          if(this.level>=3||twinShotLv>=1){
            const cols=[0x00EAFF,0xa259ff]
            cols.forEach((c,idx)=>{
              const offset=idx===0?-20:20
              const b2=this.add.container(this.player.x+offset,this.player.y-42)
              const g2=this.add.graphics()
              g2.fillStyle(0xFFE566,1); g2.fillEllipse(0,-10,4,8)
              g2.fillStyle(c,1); g2.fillRect(-2,-8,4,14)
              const t2=this.add.circle(0,-10,3,c,0.9)
              const trail2=this.add.graphics(); trail2.lineStyle(2,c,0.3); trail2.beginPath(); trail2.moveTo(0,0); trail2.lineTo(0,12); trail2.strokePath()
              b2.add([trail2,g2,t2]);(b2 as any).col=c;(b2 as any).dmg=1
              this.bullets.add(b2)
            })
          }
          if(this.level>=5){
            const b3=this.add.container(this.player.x,this.player.y-55)
            const g3=this.add.graphics(); g3.fillStyle(0xFF6EC7,1); g3.fillRect(-4,-14,8,28)
            b3.add([g3]);(b3 as any).col=0xFF6EC7;(b3 as any).dmg=2
            this.bullets.add(b3)
          }
        }

        // Enemy spawn
        this.enemyTimer+=delta
        const eInterval=Math.max(800,3500-this.level*100)
        if(this.enemyTimer>eInterval){ this.enemyTimer=0; this.spawnEnemy(Phaser.Math.Between(0,4)) }

        // Obstacle spawn
        this.obstTimer+=delta
        const oInterval=Math.max(1500,4000-this.level*200)
        if(this.obstTimer>oInterval){ this.obstTimer=0; this.spawnObstacle(Phaser.Math.Between(0,4)) }

        // Coin spawn
        this.coinTimer+=delta
        if(this.coinTimer>900){ this.coinTimer=0; this.spawnCoin(Phaser.Math.Between(0,4)) }

        // Supply drop spawn (UN SINGUR BLOC - FIX)
        this.supplyTimer+=delta
        if(this.supplyTimer>Phaser.Math.Between(8000,15000)){
          this.supplyTimer=0
          this.spawnSupplyDrop()
        }

        // ── NOU: Airplane spawn - din cand in cand ──
        this.airplaneTimer+=delta
        // Avionul apare la interval random intre 12s-25s, mai des la nivel mare
        const airplaneInterval = Math.max(8000, 25000 - this.level * 1000)
        if(this.airplaneTimer > airplaneInterval + Phaser.Math.Between(0, 5000)){
          this.airplaneTimer=0
          this.spawnAirplane()
        }

        // ── NOU: Update avioane - drop bombe periodic in timp ce zboara ──
        this.airplaneGroup.getChildren().forEach((plane:any) => {
          if(!plane.active) return
          plane.bombTimer = (plane.bombTimer || 0) + delta
          if(plane.bombsDropped < plane.maxBombs && plane.bombTimer > plane.bombInterval) {
            plane.bombTimer = 0
            plane.bombsDropped++
            // Bombeaza doar daca avionul e pe ecran (nu in afara)
            const W2 = this.scale.width
            if(plane.x > 0 && plane.x < W2) {
              this.spawnAirplaneBomb(plane.x, plane.y + 25)
            }
          }
        })

        // ── NOU: Update bombe avion - coliziune cu jucatorul ──
        this.airplaneBombs.getChildren().forEach((bomb:any) => {
          if(!bomb.active) return
          // Coliziune cu jucatorul
          if(Math.abs(bomb.x - this.player.x) < 30 && Math.abs(bomb.y - this.player.y) < 35) {
            this.spawnExplosion(bomb.x, bomb.y)
            bomb.destroy()
            this.takeDamage()
          }
        })

        // Enemy lasers
        this.laserTimer+=delta
        if(this.laserTimer>Math.max(2500,6000-this.level*200)){
          this.laserTimer=0
          this.enemies.getChildren().forEach((e:any)=>{
            if(!e.active||e.y<80||e.y>H-100) return
            const col=LASER_COLORS[Phaser.Math.Between(0,LASER_COLORS.length-1)]
            const l=this.add.container(e.x,e.y+35)
            const lg=this.add.graphics(); lg.fillStyle(col,1); lg.fillRect(-3,-12,6,24)
            const lt=this.add.circle(0,12,4,col,0.7)
            l.add([lg,lt]);(l as any).col=col
            this.enemyLasers.add(l)
          })
        }

        // Ambient lightning
        this.lightningTimer+=delta
        if(this.lightningTimer>Phaser.Math.Between(3000,7000)){
          this.lightningTimer=0
          const lx=Phaser.Math.Between(50,this.scale.width-50)
          const lg=this.add.graphics()
          let cy2=70
          while(cy2<this.scale.height/2){
            const ny=cy2+Phaser.Math.Between(20,40)
            const nx=lx+Phaser.Math.Between(-15,15)
            lg.lineStyle(2,0xFFFFFF,0.8); lg.beginPath(); lg.moveTo(lx,cy2); lg.lineTo(nx,ny); lg.strokePath()
            cy2=ny
          }
          this.tweens.add({targets:lg,alpha:0,duration:200,onComplete:()=>lg.destroy()})
          audio.sfx('thunder')
        }

        // NITRO update
        if(this.nitroActive){
          this.nitroTimer-=delta
          if(this.nitroTimer<=0){ this.nitroActive=false; this.speedMult=1 }
        }
        if(this.nitroCooldown>0) this.nitroCooldown-=delta
        const nitroFill = this.nitroActive ? 80 : Math.max(0, 80*(1-this.nitroCooldown/15000))
        if((this as any).nitroBar) (this as any).nitroBar.width = nitroFill

        // FUEL update
        this.fuelTimer+=delta
        if(this.fuelTimer>500){ this.fuelTimer=0; this.fuel=Math.max(0,this.fuel-0.5) }
        if((this as any).fuelBar) (this as any).fuelBar.width = (this.fuel/100)*80
        if(this.fuel<=0) this.speedMult=Math.max(0.3,this.speedMult*0.99)

        // Combo decay
        if(this.combo>0){
          this.comboTimer+=delta
          if(this.comboTimer>2000){ this.combo=0; this.comboTimer=0 }
        }
        if(this.magnet){ this.magnetTimer-=delta; if(this.magnetTimer<=0){ this.magnet=false } }
        if(this.doubleScore){ this.doubleTimer-=delta; if(this.doubleTimer<=0){ this.doubleScore=false } }

        // Engine sound
        this.engSpeed = Math.min(this.maxEngSpeed, this.engSpeed + (this.isAccel?2:0) - (!this.isAccel?1:0))
        this.engSpeed = Math.max(0, this.engSpeed)
        this.isAccel = !!(touchInput.current.left||touchInput.current.right||this.cursors?.left?.isDown||this.cursors?.right?.isDown)
        audio.updateEngine(this.engSpeed, this.maxEngSpeed, this.isAccel)

        const eSpeed=(0.6+this.level*0.10)*this.speedMult*speedBonus

        // Bullets move & hit
        this.bullets.getChildren().forEach((b:any)=>{
          if(!b.active) return
          b.y-=9
          if(this.magnet){
            this.coinGroup.getChildren().forEach((coin:any)=>{
              if(!coin.active) return
              const dx2=this.player.x-coin.x, dy2=this.player.y-coin.y
              const dist=Math.sqrt(dx2*dx2+dy2*dy2)
              if(dist<magnetRange){ coin.x+=dx2*0.08; coin.y+=dy2*0.08 }
            })
          }
          if(b.y<70){b.destroy();return}
          this.enemies.getChildren().forEach((e:any)=>{
            if(!e.active) return
            if(Math.abs(b.x-e.x)<32&&Math.abs(b.y-e.y)<32){
              b.destroy()
              e.hp=(e.hp||1)-(b.dmg||1)
              if(e.hp===1&&e.hp2){
                e.hp2.destroy();(e as any).hp2=null
              }
              if(e.hp<=0){
                this.spawnExplosion(e.x,e.y)
                e.destroy()
                const pts=50*this.level
                this.combo=(this.combo||0)+1
                this.streak=(this.streak||0)+1
                this.comboTimer=0
                const bonusMult = this.combo>=5?3:this.combo>=3?2:1
                const finalPts = pts * bonusMult * (this.doubleScore?2:1)
                this.score+=finalPts; setScore(this.score)
                if(this.combo>=3){
                  const ct=this.add.text(this.player.x,this.player.y-80,`x${this.combo} COMBO! +${finalPts}`,{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#FFD700',stroke:'#000',strokeThickness:3}).setOrigin(0.5)
                  this.tweens.add({targets:ct,y:ct.y-50,alpha:0,duration:900,onComplete:()=>ct.destroy()})
                }
                this.scoreText.setText('SCORE: '+this.score)
                audio.sfx('hit')
                const t=this.add.text(e.x,e.y-20,`+${pts}`,{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#FFD700',stroke:'#000',strokeThickness:2}).setOrigin(0.5)
                this.tweens.add({targets:t,y:t.y-50,alpha:0,duration:700,onComplete:()=>t.destroy()})
              }
            }
          })
          this.obstacles.getChildren().forEach((o:any)=>{
            if(!o.active) return
            if(Math.abs(b.x-o.x)<28&&Math.abs(b.y-o.y)<28){
              b.destroy()
              this.spawnExplosion(o.x,o.y)
              o.destroy()
              this.score+=20; setScore(this.score)
              this.scoreText.setText('SCORE: '+this.score)
            }
          })
          // ── NOU: bullets pot distruge bombele avionului ──
          this.airplaneBombs.getChildren().forEach((bomb:any)=>{
            if(!bomb.active) return
            if(Math.abs(b.x-bomb.x)<20&&Math.abs(b.y-bomb.y)<20){
              b.destroy()
              this.spawnExplosion(bomb.x,bomb.y)
              bomb.destroy()
              this.score+=30; setScore(this.score)
              this.scoreText.setText('SCORE: '+this.score)
              // Bonus text
              const bt=this.add.text(bomb.x,bomb.y-20,`INTERCEPTED! +30`,{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#00EAFF',stroke:'#000',strokeThickness:2}).setOrigin(0.5)
              this.tweens.add({targets:bt,y:bt.y-50,alpha:0,duration:800,onComplete:()=>bt.destroy()})
            }
          })
        })

        // Enemies move
        this.enemies.getChildren().forEach((e:any)=>{
          if(!e.active) return
          e.y+=eSpeed
          if(e.y>H+70){e.destroy();return}
          if(Math.abs(e.x-this.player.x)<30&&Math.abs(e.y-this.player.y)<40){
            this.spawnExplosion(e.x,e.y); e.destroy(); this.takeDamage()
          }
        })

        // Enemy lasers move
        this.enemyLasers.getChildren().forEach((l:any)=>{
          if(!l.active) return
          l.y+=5*this.speedMult
          if(l.y>H+20){l.destroy();return}
          if(Math.abs(l.x-this.player.x)<18&&Math.abs(l.y-this.player.y)<22){
            const f=this.add.circle(l.x,l.y,15,l.col||0xFF2244,0.6)
            this.tweens.add({targets:f,alpha:0,scaleX:2,scaleY:2,duration:200,onComplete:()=>f.destroy()})
            l.destroy(); this.takeDamage()
          }
        })

        // Obstacles move
        this.obstacles.getChildren().forEach((o:any)=>{
          if(!o.active) return
          o.y+=eSpeed*0.65
          if(o.y>H+80){o.destroy();return}
          if(Math.abs(o.x-this.player.x)<28&&Math.abs(o.y-this.player.y)<32){
            this.spawnExplosion(o.x,o.y); o.destroy(); this.takeDamage()
          }
        })

        // Coins move
        this.coinGroup.getChildren().forEach((c:any)=>{
          if(!c.active) return
          c.y+=2.2*this.speedMult
          if(c.y>H+30){c.destroy();return}
          if(Math.abs(c.x-this.player.x)<20&&Math.abs(c.y-this.player.y)<25){
            const earned=Math.round(1*coinMult)
            this.coinsCount+=earned; setCoins(this.coinsCount)
            this.coinsText.setText('COINS: '+this.coinsCount)
            audio.sfx('coin')
            const col=c.col||0xFFD700
            const t=this.add.text(c.x,c.y,`+${earned}`,{fontFamily:'Orbitron,monospace',fontSize:'10px',color:`#${col.toString(16).padStart(6,'0')}`}).setOrigin(0.5)
            this.tweens.add({targets:t,y:t.y-50,alpha:0,duration:700,onComplete:()=>t.destroy()})
            c.destroy()
          }
        })
      }

      takeDamage() {
        this.lives--
        const h=['❤ ❤ ❤','❤ ❤','❤','💀']
        this.livesText.setText(h[Math.max(0,3-this.lives)])
        this.cameras.main.shake(280,0.02)
        const f=this.add.rectangle(this.scale.width/2,this.scale.height/2,this.scale.width,this.scale.height,0xFF0000,0.3)
        this.tweens.add({targets:f,alpha:0,duration:350,onComplete:()=>f.destroy()})
        audio.sfx('hit')
        if(this.lives<=0) this.endGame()
      }

      endGame() {
        this.gameOverFlag=true
        audio.sfx('die')
        audio.stopBg()
        const W=this.scale.width,H=this.scale.height
        const ov=this.add.graphics(); ov.fillStyle(0x000000,0.85); ov.fillRect(0,0,W,H)
        const p=this.add.graphics()
        p.fillStyle(0x050A0E,0.97); p.fillRect(W/2-155,H/2-120,310,270)
        p.lineStyle(2,0xC8960C,0.9); p.strokeRect(W/2-155,H/2-120,310,270)
        p.lineStyle(1,0x39FF14,0.4); p.strokeRect(W/2-150,H/2-115,300,260)
        p.lineStyle(1,0xa259ff,0.3); p.strokeRect(W/2-145,H/2-110,290,250)
        this.add.text(W/2,H/2-90,'GAME OVER',{fontFamily:'Orbitron,monospace',fontSize:'26px',color:'#FF2244',stroke:'#000',strokeThickness:3}).setOrigin(0.5)
        this.add.text(W/2,H/2-50,`SCORE: ${this.score}`,{fontFamily:'Orbitron,monospace',fontSize:'15px',color:'#FFD700'}).setOrigin(0.5)
        this.add.text(W/2,H/2-25,`COINS: ${this.coinsCount}`,{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#39FF14'}).setOrigin(0.5)
        this.add.text(W/2,H/2+0,`LEVEL REACHED: ${this.level}`,{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#a259ff'}).setOrigin(0.5)
        this.add.text(W/2,H/2+20,char.name,{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#00EAFF'}).setOrigin(0.5)
        this.add.text(W/2,H/2+38,`BONUS ${char.coins} ACTIVE`,{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#FF6EC7'}).setOrigin(0.5)
        const btn=this.add.rectangle(W/2,H/2+80,180,40,0x000000,0).setInteractive()
        btn.setStrokeStyle(2,0x39FF14,0.9)
        this.add.text(W/2,H/2+80,'▶ PLAY AGAIN',{fontFamily:'Orbitron,monospace',fontSize:'12px',color:'#39FF14'}).setOrigin(0.5)
        btn.on('pointerover',()=>btn.setFillStyle(0x39FF14,0.15))
        btn.on('pointerout',()=>btn.setFillStyle(0x000000,0))
        btn.on('pointerdown',()=>stopGame())
        this.input.keyboard!.once('keydown-R',()=>stopGame())
      }
    }

    const GW = Math.min(window.innerWidth, window.screen.width, 720)
    const GH = Math.min(window.innerHeight - 120, Math.round(GW * 900 / 720))
    localStorage.setItem('selCar', String(selCar))
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: GW,
      height: GH,
      parent: containerRef.current!,
      backgroundColor: '#000000',
      scene: GameScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    })
  }, [started])

  if (!started) {
    return (
      <div className="cyber-bg" style={{padding:'28px 20px',maxWidth:860,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div className="cl-badge cl-badge-gold" style={{marginBottom:10}}>MOTO RUNNER V2</div>
          <h1 className="cl-title" style={{fontSize:'clamp(20px,4vw,40px)',marginBottom:4}}>SELECT & PLAY</h1>
          <p style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(162,89,255,0.5)',letterSpacing:3}}>MONAD NETWORK · EARN MOTO TOKENS · {CHARACTERS.length} CHARACTERS · {CARS.length} VEHICLES</p>
        </div>

        <div style={{marginBottom:18}}>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(0,234,255,0.6)',letterSpacing:3,marginBottom:8}}>SELECT CHARACTER</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6}}>
            {CHARACTERS.map((c,i)=>(
              <div key={c.id} onClick={()=>setSelChar(i)}
                style={{cursor:'pointer',border:`1px solid ${selChar===i?'#a259ff':'rgba(184,134,11,0.15)'}`,overflow:'hidden',
                  background:selChar===i?'rgba(162,89,255,0.08)':'rgba(5,10,14,0.97)',
                  boxShadow:selChar===i?'0 0 16px rgba(162,89,255,0.35),inset 0 0 10px rgba(162,89,255,0.05)':'none',
                  transition:'all 0.15s',position:'relative'}}>
                {selChar===i&&<div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#a259ff,transparent)'}}/>}
                <div style={{aspectRatio:'3/4',overflow:'hidden',background:'#000'}}>
                  <img src={`/characters/${c.img}`} alt={c.name}
                    style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top',
                      filter:selChar===i?'brightness(1.1) saturate(1.2)':'brightness(0.85) saturate(0.8)'}}
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                </div>
                <div style={{padding:'3px 4px',background:selChar===i?'rgba(162,89,255,0.12)':'transparent'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:6,color:selChar===i?'#a259ff':'rgba(255,215,0,0.35)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',letterSpacing:0.5}}>{c.name}</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:selChar===i?'#FFD700':'rgba(255,215,0,0.5)',fontWeight:700}}>{c.coins}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginBottom:24}}>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(0,234,255,0.6)',letterSpacing:3,marginBottom:8}}>SELECT VEHICLE</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6}}>
            {CARS.map((c,i)=>(
              <div key={c.id} onClick={()=>setSelCar(i)}
                style={{cursor:'pointer',border:`1px solid ${selCar===i?'#00EAFF':'rgba(184,134,11,0.15)'}`,overflow:'hidden',
                  background:selCar===i?'rgba(0,234,255,0.06)':'rgba(5,10,14,0.97)',
                  boxShadow:selCar===i?'0 0 16px rgba(0,234,255,0.3),inset 0 0 10px rgba(0,234,255,0.04)':'none',
                  transition:'all 0.15s',position:'relative'}}>
                {selCar===i&&<div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#00EAFF,transparent)'}}/>}
                <div style={{aspectRatio:'4/3',overflow:'hidden',background:'#000',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <img src={`/cars/${c.img}`} alt={c.name}
                    style={{width:'100%',height:'100%',objectFit:'contain',
                      filter:selCar===i?'brightness(1.15) saturate(1.3) drop-shadow(0 0 6px #00EAFF)':'brightness(0.8) saturate(0.7)'}}
                    onError={e=>{(e.target as HTMLImageElement).src='/cars/body.jpeg'}}/>
                </div>
                <div style={{padding:'3px 4px',background:selCar===i?'rgba(0,234,255,0.1)':'transparent'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:6,color:selCar===i?'#00EAFF':'rgba(255,215,0,0.35)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',gap:16,marginBottom:24,padding:'12px 16px',border:'1px solid rgba(200,150,12,0.2)',background:'rgba(5,10,14,0.8)'}}>
          <img src={`/characters/${CHARACTERS[selChar].img}`} style={{width:48,height:64,objectFit:'cover',objectPosition:'top',border:'1px solid rgba(162,89,255,0.4)'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
          <img src={`/cars/${CARS[selCar].img}`} style={{width:90,height:70,objectFit:'contain',alignSelf:'center',filter:'drop-shadow(0 0 10px #00EAFF) brightness(1.2)'}} onError={e=>{(e.target as HTMLImageElement).src='/cars/body.jpeg'}}/>
          <div style={{flex:1}}>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:11,color:'#FFD700',marginBottom:4}}>{CHARACTERS[selChar].name}</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#39FF14',marginBottom:2}}>COIN BONUS: {CHARACTERS[selChar].coins}</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#00EAFF'}}>VEHICLE: {CARS[selCar].name}</div>
            <div style={{display:'flex',gap:8,marginTop:4,justifyContent:'center'}}>
              <span style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'#FFD700'}}>TURBO: {((CARS[selCar] as any).turbo||1).toFixed(1)}x</span>
              <span style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'#39FF14'}}>ARMOR: {((CARS[selCar] as any).armor||1).toFixed(1)}x</span>
              <span style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'#a259ff'}}>WEIGHT: {((CARS[selCar] as any).weight||1).toFixed(1)}x</span>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:4,justifyContent:'center'}}>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'rgba(255,215,0,0.4)'}}>17 ENEMY TOKENS</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'rgba(57,255,20,0.4)'}}>4 ROAD OBSTACLES</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'rgba(162,89,255,0.4)'}}>✈ AIR STRIKES</div>
          </div>
        </div>

        <div style={{textAlign:'center'}}>
          <button onClick={()=>setStarted(true)} className="cl-btn cl-btn-gold" style={{fontSize:14,padding:'15px 56px',letterSpacing:4}}>
            ▶ START GAME
          </button>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.2)',marginTop:12,letterSpacing:2}}>
            ← → ARROWS / A D · AUTO FIRE · N NITRO · R RESTART · AIR STRIKES INCLUDED
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cyber-bg" style={{padding:'14px',display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div style={{marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',maxWidth:720}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="cl-badge cl-badge-gold">LIVE</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.45)'}}>MOTO RUNNER V2</span>
        </div>
        <div style={{display:'flex',gap:20}}>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#FFD700'}}>SCORE: {score}</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#39FF14'}}>COINS: {coins}</span>
        </div>
        <button onClick={stopGame} className="cl-btn cl-btn-ghost" style={{fontSize:8,padding:'4px 10px'}}>EXIT</button>
      </div>
      <div ref={containerRef} style={{border:'1px solid rgba(200,150,12,0.35)',boxShadow:'0 0 40px rgba(57,255,20,0.08)',width:'100%',maxWidth:720,touchAction:'manipulation'}}/>

      <div style={{display:('ontouchstart' in window)?'flex':'none',justifyContent:'space-between',alignItems:'center',width:'100%',maxWidth:720,marginTop:10,padding:'0 8px',userSelect:'none'}}>
        <button
          onTouchStart={(ev)=>{ ev.preventDefault(); touchInput.current.left=true }}
          onTouchEnd={(ev)=>{ ev.preventDefault(); touchInput.current.left=false }}
          style={{width:72,height:72,borderRadius:'50%',background:'rgba(0,234,255,0.15)',border:'2px solid rgba(0,234,255,0.6)',color:'#00EAFF',fontSize:28,display:'flex',alignItems:'center',justifyContent:'center',WebkitTapHighlightColor:'transparent',cursor:'pointer',boxShadow:'0 0 16px rgba(0,234,255,0.3)',touchAction:'manipulation'}}
        >⬅️</button>
        <button
          onTouchStart={(ev)=>{ ev.preventDefault(); touchInput.current.pause=true }}
          style={{width:52,height:52,borderRadius:'50%',background:'rgba(255,215,0,0.1)',border:'2px solid rgba(255,215,0,0.4)',color:'#FFD700',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',WebkitTapHighlightColor:'transparent',cursor:'pointer',touchAction:'manipulation'}}
        >⏸</button>
        <button
          onTouchStart={(ev)=>{ ev.preventDefault(); touchInput.current.right=true }}
          onTouchEnd={(ev)=>{ ev.preventDefault(); touchInput.current.right=false }}
          style={{width:72,height:72,borderRadius:'50%',background:'rgba(0,234,255,0.15)',border:'2px solid rgba(0,234,255,0.6)',color:'#00EAFF',fontSize:28,display:'flex',alignItems:'center',justifyContent:'center',WebkitTapHighlightColor:'transparent',cursor:'pointer',boxShadow:'0 0 16px rgba(0,234,255,0.3)',touchAction:'manipulation'}}
        >➡️</button>
      </div>
    </div>
  )
}
