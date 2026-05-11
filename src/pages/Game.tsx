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
  { id:1, name:'STREET RUNNER', img:'1.png.jpg' },
  { id:2, name:'NEON RACER',    img:'2.png.jpg' },
  { id:3, name:'CYBER HAWK',    img:'3.png.jpg' },
  { id:4, name:'TURBO GHOST',   img:'4.png.jpg' },
  { id:5, name:'IRON CLAW',     img:'5.png.jpg' },
  { id:6, name:'PLASMA BLADE',  img:'6.png.jpg' },
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

  // ── Background music: dark driving beat with bass and synth ────────────────
  startBg() {
    if (this.bgPlaying) return
    this.bgPlaying = true
    const bpm = 128, bar = (60/bpm)*4

    // Bass drone
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

    // Pad synth
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

    // Hi-hat pulse
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

    // Bird chirps (ambient)
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

    // Wind low rumble
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

  sfx(type: 'shoot'|'hit'|'coin'|'die'|'obstacle'|'thunder') {
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
        // Thunder crack for obstacle explosion
        const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(c.sampleRate*0.1))
        const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain()
        f.type = 'lowpass'; f.frequency.value = 600
        src.buffer = buf; src.connect(f); f.connect(g); g.connect(this.sfxGain)
        g.gain.value = 0.6; src.start()
      } else if (type === 'thunder') {
        // Lightning crack
        const buf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(c.sampleRate*0.05))
        const src = c.createBufferSource(), g = c.createGain()
        src.buffer = buf; src.connect(g); g.connect(this.sfxGain)
        g.gain.value = 0.7; src.start()
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

    // Init audio on user gesture
    if (!audioRef.current) audioRef.current = new AudioEngine()
    audioRef.current.startBg()

    const char     = CHARACTERS[selChar]
    const car      = CARS[selCar]
    const coinMult = parseFloat(char.coins.replace('x',''))
    const audio    = audioRef.current

    class GameScene extends Phaser.Scene {
      player!: Phaser.GameObjects.Container
      bullets!: Phaser.GameObjects.Group
      enemies!: Phaser.GameObjects.Group
      enemyLasers!: Phaser.GameObjects.Group
      obstacles!: Phaser.GameObjects.Group
      coinGroup!: Phaser.GameObjects.Group
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys
      wasd!: any
      score = 0; lives = 3; coinsCount = 0
      scoreText!: Phaser.GameObjects.Text
      livesText!: Phaser.GameObjects.Text
      coinsText!: Phaser.GameObjects.Text
      levelText!: Phaser.GameObjects.Text
      gameOverFlag = false
      paused = false
      shootTimer=0; enemyTimer=0; coinTimer=0; obstTimer=0; laserTimer=0
      supplyTimer=0
      shield=false; shieldGfx:any=null
      magnet=false; magnetTimer=0
      doubleScore=false; doubleTimer=0
      combo=0; comboTimer=0; comboText:any=null
      streak=0
      birdTimer=0; lightningTimer=0
      playerLane=2
      lanes=[80,180,280,380,480]
      level=1; levelThreshold=100
      levelConfig: any = {}
      speedMult = 1
      motoMult = 1
      togglePause: () => void = () => {}
      roadLines: Phaser.GameObjects.Rectangle[] = []

      constructor() { super('GameScene') }

      preload() {
        // Load MOTO coin images
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
        // Load level background
        try {
          const _lc = JSON.parse(localStorage.getItem('activeLevel') || '{}')
          if (_lc?.img) {
            // Encode special chars in filename
            const parts = _lc.img.split('/')
            const encoded = parts.map((p: string, i: number) => i === parts.length-1 ? encodeURIComponent(p) : p).join('/')
            console.log('[Game] Loading levelBg:', encoded)
            this.load.image('levelBg', encoded)
          }
        } catch(e) { console.warn('preload level img error', e) }
        this.load.image('car', `/cars/${car.img}`)
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
      }

      create() {
        // Load active level config
        try {
          const lc = JSON.parse(localStorage.getItem('activeLevel') || '{}')
          if (lc && lc.id) {
            this.levelConfig = lc
            this.speedMult = lc.mult || 1
            this.motoMult = lc.moto || 1
          }
        } catch(_) {}
        const W=this.scale.width, H=this.scale.height

        // ── BG: level image + dark overlay + stars ──
        const bg=this.add.graphics()
        bg.fillGradientStyle(0x000000,0x000000,0x030A05,0x030A05,1)
        bg.fillRect(0,0,W,H)
        // Level background image
        if (this.textures.exists('levelBg')) {
          const bgImg=this.add.image(W/2,H*0.32,'levelBg')
          bgImg.setDisplaySize(W,H*0.7)
          bgImg.setAlpha(0.35).setDepth(-1)
        }
        // Stars
        for(let i=0;i<60;i++){
          const sx=Phaser.Math.Between(0,W), sy=Phaser.Math.Between(70,H*0.5)
          const star=this.add.circle(sx,sy,Math.random()<0.3?1.5:0.8,0xFFFFFF,0.4+Math.random()*0.5)
          this.tweens.add({targets:star,alpha:{from:0.2,to:0.9},duration:800+Math.random()*2000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
        }

        // ── Road ────────────────────────────────────────────────────────────
        const road=this.add.graphics()
        road.fillStyle(0x080F14,1)
        road.fillRect(40,0,W-80,H)
        // Road surface sheen
        road.fillGradientStyle(0x39FF14,0x39FF14,0x003300,0x003300,0.04,0.04,0,0)
        road.fillRect(40,0,15,H)
        road.fillGradientStyle(0x003300,0x003300,0x39FF14,0x39FF14,0,0,0.04,0.04)
        road.fillRect(W-55,0,15,H)

        // Road border glow lines
        const gl=this.add.graphics()
        gl.lineStyle(2,0x39FF14,0.6); gl.strokeRect(40,0,W-80,H)
        gl.lineStyle(1,0x004400,0.3); gl.beginPath(); gl.moveTo(42,0); gl.lineTo(42,H); gl.strokePath()
        gl.moveTo(W-42,0); gl.lineTo(W-42,H); gl.strokePath()

        // Animated lane dashes
        for(let lane=1;lane<5;lane++){
          const lx=40+lane*((W-80)/5)
          for(let y=-60;y<H+60;y+=60){
            const r=this.add.rectangle(lx,y,2,32,0x39FF14,0.2)
            this.roadLines.push(r)
            this.tweens.add({targets:r,y:`+=${H+60}`,duration:1000,repeat:-1,ease:'Linear',delay:(y/60)*166})
          }
        }

        // ── Player car — NO flat photo, composite visual ─────────────────────
        this.player = this.add.container(this.lanes[this.playerLane], H-90)
        // Underbody glow
        const underGlow=this.add.ellipse(0,42,90,24,0x00EAFF,0.35)
        // MASINA COMPOZITA: body + 4 roti animate
        const bodyImg = this.add.image(0, -5, 'body')
        bodyImg.setDisplaySize(72, 110)
        // Roți față
        const wFL = this.add.image(-32, -38, 'wheel_fl')
        wFL.setDisplaySize(28, 28)
        const wFR = this.add.image(32, -38, 'wheel_fr')
        wFR.setDisplaySize(28, 28)
        // Roți spate
        const wRL = this.add.image(-32, 38, 'wheel_rl')
        wRL.setDisplaySize(28, 28)
        const wRR = this.add.image(32, 38, 'wheel_rr')
        wRR.setDisplaySize(28, 28)
        // Spin roti continuu
        this.tweens.add({targets:[wFL,wFR,wRL,wRR], angle:360, duration:300, repeat:-1, ease:'Linear'})
        // Engine glow sub masina
        const engGlow=this.add.circle(0, 52, 14, 0x39FF14, 0.7)
        this.tweens.add({targets:engGlow,alpha:{from:0.3,to:1},scaleX:{from:0.8,to:1.3},scaleY:{from:0.8,to:1.3},duration:200,yoyo:true,repeat:-1})
        // Glow iridescent pe body
        const holoGfx=this.add.graphics()
        holoGfx.lineStyle(2,0x00EAFF,0.25); holoGfx.strokeRect(-36,-55,72,110)
        holoGfx.lineStyle(1,0xa259ff,0.15); holoGfx.strokeRect(-30,-50,60,100)
        // Speed lines deasupra
        const spd=this.add.graphics()
        spd.lineStyle(1,0x39FF14,0.5); spd.beginPath()
        spd.moveTo(-20,-58); spd.lineTo(-20,-78)
        spd.moveTo(20,-58); spd.lineTo(20,-78)
        spd.moveTo(-8,-58); spd.lineTo(-8,-85)
        spd.moveTo(8,-58); spd.lineTo(8,-85)
        spd.strokePath()
        // MITRALIERA pe masina
        const gunImg = this.add.image(0, -55, 'machinegun')
        gunImg.setDisplaySize(22, 28)
        gunImg.setTint(0xFFD700)
        this.player.add([underGlow, wFL, wFR, wRL, wRR, bodyImg, holoGfx, engGlow, spd, gunImg])

        // ── Character portrait (3D framed) ──────────────────────────────────
        const cpx=W-48, cpy=H-70
        const cpBg=this.add.graphics()
        cpBg.fillStyle(0x050A0E,0.95); cpBg.fillRect(cpx-38,cpy-50,76,90)
        // Triple border: gold / purple / cyan
        cpBg.lineStyle(2,0xC8960C,0.9); cpBg.strokeRect(cpx-38,cpy-50,76,90)
        cpBg.lineStyle(1,0xa259ff,0.5); cpBg.strokeRect(cpx-35,cpy-47,70,84)
        cpBg.lineStyle(1,0x00EAFF,0.3); cpBg.strokeRect(cpx-32,cpy-44,64,78)
        const charPortrait=this.add.image(cpx,cpy,'char').setDisplaySize(66,82)
        // Iridescent shimmer tween
        this.tweens.add({targets:charPortrait,tint:{from:0xFFFFFF,to:0xa259ff},duration:2000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
        // Name tag below portrait
        this.add.text(cpx,cpy+50,char.name.split(' ')[0],{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'#00EAFF'}).setOrigin(0.5)

        // Groups
        this.bullets     = this.add.group()
        this.enemies     = this.add.group()
        this.enemyLasers = this.add.group()
        this.obstacles   = this.add.group()
        this.coinGroup   = this.add.group()

        // Controls
        this.cursors=this.input.keyboard!.createCursorKeys()
        this.wasd=this.input.keyboard!.addKeys('W,A,S,D')

        // ── HUD top bar ──────────────────────────────────────────────────────
        const hud=this.add.graphics()
        hud.fillStyle(0x000000,0.88); hud.fillRect(0,0,W,70)
        hud.lineStyle(1,0xC8960C,0.6); hud.strokeRect(0,0,W,70)
        hud.lineStyle(1,0x39FF14,0.2); hud.strokeRect(2,2,W-4,66)

        const ts={fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#FFD700'}
        this.scoreText=this.add.text(10,8,'SCORE: 0',ts)
        this.livesText=this.add.text(10,26,'❤ ❤ ❤',{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#FF2244'})
        this.coinsText=this.add.text(10,48,'COINS: 0',{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#FFD700'})
        // ── PAUSE button ─────────────────────────────────────────────────────
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
        // P key
        this.input.keyboard!.on('keydown-P',this.togglePause)
        this.add.text(W/2,6,char.name,{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#00EAFF'}).setOrigin(0.5,0)
        this.add.text(W/2,20,`BONUS ${char.coins}`,{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#39FF14'}).setOrigin(0.5,0)
        const lvName=this.levelConfig?.name?`${this.levelConfig.name} · LV1`:'LEVEL 1'
        this.levelText=this.add.text(W/2,36,lvName,{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#a259ff'}).setOrigin(0.5,0)
        this.add.text(W-8,8,'MOTO RUNNER',{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#BF5FFF'}).setOrigin(1,0)
        this.add.text(W-8,24,'← → MOVE',{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'rgba(255,215,0,0.3)'}).setOrigin(1,0)
        this.add.text(W-8,40,'AUTO FIRE',{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'rgba(57,255,20,0.3)'}).setOrigin(1,0)
      }

      // ── Explosion: lightning bolts + particle coins ─────────────────────────
      spawnExplosion(x:number, y:number) {
        audio.sfx('obstacle')
        audio.sfx('thunder')

        // Lightning bolts radiating out
        for(let i=0;i<8;i++){
          const angle=(i/8)*Math.PI*2
          const len=30+Phaser.Math.Between(10,40)
          const col=EXPLODE_COLORS[Phaser.Math.Between(0,EXPLODE_COLORS.length-1)]
          const gfx=this.add.graphics()
          gfx.lineStyle(2,col,1)
          // Jagged lightning path
          let cx2=x, cy2=y
          for(let seg=0;seg<4;seg++){
            const nx=cx2+Math.cos(angle)*(len/4)+Phaser.Math.Between(-8,8)
            const ny=cy2+Math.sin(angle)*(len/4)+Phaser.Math.Between(-8,8)
            gfx.beginPath(); gfx.moveTo(cx2,cy2); gfx.lineTo(nx,ny); gfx.strokePath()
            cx2=nx; cy2=ny
          }
          this.tweens.add({targets:gfx,alpha:0,duration:350+Phaser.Math.Between(0,200),onComplete:()=>gfx.destroy()})
        }

        // White flash
        const flash=this.add.circle(x,y,40,0xFFFFFF,0.9)
        this.tweens.add({targets:flash,alpha:0,scaleX:3,scaleY:3,duration:200,onComplete:()=>flash.destroy()})

        // Glow ring
        const ring=this.add.circle(x,y,10,0x39FF14,0)
        ring.setStrokeStyle(3,0x39FF14,0.9)
        this.tweens.add({targets:ring,scaleX:5,scaleY:5,alpha:0,duration:400,onComplete:()=>ring.destroy()})

        // Coin particles flying out
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
          // Coin value text
          const val=Phaser.Math.Between(2,8)
          const ct=this.add.text(x+vx*0.5,y-30,`+${val}`,{fontFamily:'Orbitron,monospace',fontSize:'9px',color:`#${col.toString(16).padStart(6,'0')}`})
          this.tweens.add({targets:ct,y:ct.y-40,alpha:0,duration:900,onComplete:()=>ct.destroy()})
        }

        // Camera shake
        this.cameras.main.shake(300,0.02)
      }

      // ── Sculpted enemy: logo as coin/token shape, NOT flat photo ────────────
      spawnEnemy(lane:number) {
        const eData=ENEMY_IMGS[Phaser.Math.Between(0,ENEMY_IMGS.length-1)]
        const x=this.lanes[lane]

        // Container-based enemy: hex ring + logo + animated aura
        const container=this.add.container(x,-60)

        // Outer hex glow ring
        const aura=this.add.graphics()
        const auraCol=LASER_COLORS[Phaser.Math.Between(0,LASER_COLORS.length-1)]
        aura.lineStyle(3,auraCol,0.8)
        // Draw hexagon
        const r=30
        aura.beginPath()
        for(let i=0;i<6;i++){
          const a=Math.PI/180*(60*i-30)
          i===0 ? aura.moveTo(Math.cos(a)*r,Math.sin(a)*r) : aura.lineTo(Math.cos(a)*r,Math.sin(a)*r)
        }
        aura.closePath(); aura.strokePath()

        // Inner filled circle BG (dark)
        const bg2=this.add.circle(0,0,22,0x050A0E,0.95)
        bg2.setStrokeStyle(1,auraCol,0.5)

        // Logo image
        const logo=this.add.image(0,0,`enemy_${eData.key}`)
        logo.setDisplaySize(34,34)

        // Scanline overlay (gives depth/sculpt feel)
        const scan=this.add.graphics()
        for(let sy=-17;sy<17;sy+=3){
          scan.lineStyle(1,0x000000,0.25)
          scan.beginPath(); scan.moveTo(-17,sy); scan.lineTo(17,sy); scan.strokePath()
        }
        // Extra inner glow ring for sculpted look
        const innerGlow=this.add.graphics()
        innerGlow.lineStyle(2,auraCol,0.4); innerGlow.strokeCircle(0,0,14)
        // Iridescent shimmer
        const es1=this.add.circle(-8,-8,3,0xa259ff,0.5)
        const es2=this.add.circle(8,8,2,0x00eaff,0.4)
        const es3=this.add.circle(8,-8,2,0xff6ec7,0.3)
        // White flash highlight (top-left)
        const highlight=this.add.circle(-10,-10,4,0xFFFFFF,0.15)

        // HP pip
        const hp1=this.add.rectangle(-10,28,8,4,0x39FF14,0.9)
        const hp2=this.add.rectangle(2,28,8,4,0x39FF14,0.9)

        container.add([aura,bg2,logo,scan,innerGlow,es1,es2,es3,highlight,hp1,hp2])
        ;(container as any).hp=2
        ;(container as any).aura=aura
        ;(container as any).auraCol=auraCol
        ;(container as any).hp1=hp1
        ;(container as any).hp2=hp2
        ;(container as any).lane=lane

        // Spin aura
        this.tweens.add({targets:aura,angle:360,duration:2000+Math.random()*1000,repeat:-1,ease:'Linear'})
        // Pulse bg
        this.tweens.add({targets:bg2,scaleX:{from:0.95,to:1.05},scaleY:{from:0.95,to:1.05},duration:600,yoyo:true,repeat:-1})

        this.enemies.add(container)
      }

      // ── Spawns ────────────────────────────────────────────────────────────
      spawnObstacle(lane:number) {
        const oData=OBSTACLE_IMGS[Phaser.Math.Between(0,OBSTACLE_IMGS.length-1)]
        const x=this.lanes[lane]
        const container=this.add.container(x,-70)

        const glow=this.add.circle(0,0,32,0xFF2244,0)
        glow.setStrokeStyle(2,0xFF2244,0.6)
        const img=this.add.image(0,0,oData.key).setDisplaySize(48,48)
        // Warning triangle
        const warn=this.add.triangle(0,-40, -8,0, 8,0, 0,-14, 0xFFD700,0.8)
        this.tweens.add({targets:warn,alpha:{from:0.2,to:1},duration:300,yoyo:true,repeat:-1})
        // Rotate slowly
        this.tweens.add({targets:img,angle:360,duration:4000,repeat:-1,ease:'Linear'})
        this.tweens.add({targets:glow,scaleX:{from:0.8,to:1.2},scaleY:{from:0.8,to:1.2},duration:500,yoyo:true,repeat:-1})

        container.add([glow,img,warn])
        ;(container as any).lane=lane
        this.obstacles.add(container)
      }

      spawnCoin(lane:number) {
        const x=this.lanes[lane]
        const container=this.add.container(x,-20)
        // Pick random MOTO coin image
        const coinKeys=['coin1','coin2','coin3','coin4','coin5','coin6','coin7','coin8']
        const ck=coinKeys[Phaser.Math.Between(0,coinKeys.length-1)]
        // Outer green glow ring
        const glowRing=this.add.graphics()
        glowRing.lineStyle(4,0x39FF14,0.5); glowRing.strokeCircle(0,0,16)
        const glowRing2=this.add.graphics()
        glowRing2.lineStyle(2,0x00FF00,0.25); glowRing2.strokeCircle(0,0,22)
        // Gold ring
        const goldRing=this.add.graphics()
        goldRing.lineStyle(2,0xFFD700,0.9); goldRing.strokeCircle(0,0,13)
        // Dark bg circle
        const bgCircle=this.add.circle(0,0,12,0x050A0E,0.95)
        // Coin logo image
        const img=this.add.image(0,0,ck)
        img.setDisplaySize(20,20)
        // Iridescent shimmer dots
        const sh1=this.add.circle(-5,-5,2,0xa259ff,0.7)
        const sh2=this.add.circle(4,4,1.5,0x00eaff,0.6)
        const sh3=this.add.circle(5,-3,1,0xff6ec7,0.5)
        container.add([glowRing2,glowRing,goldRing,bgCircle,img,sh1,sh2,sh3])
        ;(container as any).col=0xFFD700
        // Pulse glow
        this.tweens.add({targets:glowRing,scaleX:{from:0.8,to:1.3},scaleY:{from:0.8,to:1.3},alpha:{from:0.3,to:0.9},duration:600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
        // Spin logo
        this.tweens.add({targets:img,angle:360,duration:1800,repeat:-1,ease:'Linear'})
        // Shimmer cycle
        this.tweens.add({targets:[sh1,sh2,sh3],alpha:{from:0.2,to:1},duration:400+Math.random()*300,yoyo:true,repeat:-1})
        this.coinGroup.add(container)
      }


      spawnSupplyDrop() {
        const lane = Phaser.Math.Between(0, 4)
        const x = this.lanes[lane]
        const type = Phaser.Math.Between(0, 2) // 0=viata 1=shield 2=magnet
        const colors = [0x39FF14, 0x00EAFF, 0xa259ff]
        const col = colors[type]
        const container = this.add.container(x, -80)

        // Parasuta imagine reala
        const chuteImg = this.add.image(0, -45, 'parasuta')
        chuteImg.setDisplaySize(70, 65)
        // Glow pe parasuta
        const chuteGlow = this.add.graphics()
        chuteGlow.lineStyle(2, 0xFFD700, 0.6); chuteGlow.strokeEllipse(0, -45, 72, 50)
        // Corzi de la parasuta la box
        const chuteGfx = this.add.graphics()
        chuteGfx.lineStyle(1, 0x39FF14, 0.8)
        chuteGfx.beginPath()
        chuteGfx.moveTo(-20, -20); chuteGfx.lineTo(0, 10)
        chuteGfx.moveTo(20, -20); chuteGfx.lineTo(0, 10)
        chuteGfx.moveTo(0, -18); chuteGfx.lineTo(0, 10)
        chuteGfx.strokePath()

        // Box supply - dark bg
        const boxBg = this.add.rectangle(0, 14, 28, 24, 0x050A0E, 0.95)
        boxBg.setStrokeStyle(2, col, 1)
        // Gold corners
        const corners = this.add.graphics()
        corners.lineStyle(2, 0xFFD700, 0.9)
        corners.beginPath()
        corners.moveTo(-14, -4); corners.lineTo(-14, -12); corners.lineTo(-6, -12)
        corners.moveTo(14, -4); corners.lineTo(14, -12); corners.lineTo(6, -12)
        corners.moveTo(-14, 32); corners.lineTo(-14, 26); corners.lineTo(-6, 26)
        corners.moveTo(14, 32); corners.lineTo(14, 26); corners.lineTo(6, 26)
        corners.strokePath()
        // Supply image
        const imgKey = Phaser.Math.Between(0,1) === 0 ? 'supply1' : 'supply2'
        const supImg = this.add.image(0, 14, imgKey).setDisplaySize(22, 20)
        // Glow ring
        const glowRing = this.add.graphics()
        glowRing.lineStyle(3, col, 0.6); glowRing.strokeCircle(0, 14, 18)
        // Iridescent shimmer
        const sh1 = this.add.circle(-8, 8, 2, 0xa259ff, 0.7)
        const sh2 = this.add.circle(8, 8, 2, 0x00eaff, 0.6)
        const sh3 = this.add.circle(0, 20, 1.5, 0xff6ec7, 0.5)

        container.add([chuteImg, chuteGlow, chuteGfx, glowRing, boxBg, corners, supImg, sh1, sh2, sh3])
        ;(container as any).supplyType = type
        ;(container as any).isSupply = true

        // Animatii
        this.tweens.add({targets: glowRing, scaleX:{from:0.8,to:1.3}, scaleY:{from:0.8,to:1.3}, alpha:{from:0.4,to:1}, duration:600, yoyo:true, repeat:-1})
        this.tweens.add({targets:[sh1,sh2,sh3], alpha:{from:0.2,to:1}, duration:400, yoyo:true, repeat:-1})
        // Legana parasuta
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
        // Gold ring burst
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
          // Level up flash
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
        if(touchInput.current.pause){ touchInput.current.pause=false; this.togglePause() }
        this.player.x=Phaser.Math.Linear(this.player.x,this.lanes[this.playerLane],0.15)
        // Tilt based on movement direction
        const targetTilt = this.player.x < this.lanes[this.playerLane] ? 0.15 : this.player.x > this.lanes[this.playerLane] ? -0.15 : 0
        this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetTilt, 0.1)

        // Auto shoot with colored lasers
        this.shootTimer+=delta
        const fireRate=Math.max(80,220-this.level*20)
        if(this.shootTimer>fireRate){
          this.shootTimer=0
          audio.sfx('shoot')
          const col=LASER_COLORS[Phaser.Math.Between(0,LASER_COLORS.length-1)]
          // Main bullet
          const b=this.add.container(this.player.x,this.player.y-55)
          const bGfx=this.add.graphics()
          // Glont mitraliera - forma realista
          bGfx.fillStyle(0xFFE566,1); bGfx.fillEllipse(0,-14,5,10)
          bGfx.fillStyle(0xC8960C,1); bGfx.fillRect(-2,-10,4,12)
          bGfx.fillStyle(0xB8860B,1); bGfx.fillRect(-2,2,4,4)
          // Glow portocaliu
          const bTip=this.add.circle(0,-14,4,0xFFD700,0.8)
          const bTrail=this.add.graphics()
          bTrail.lineStyle(2,col,0.4); bTrail.beginPath(); bTrail.moveTo(0,0); bTrail.lineTo(0,16); bTrail.strokePath()
          b.add([bTrail,bGfx,bTip]);(b as any).col=col;(b as any).dmg=1
          this.bullets.add(b)
          // Glow burst at gun
          const burst=this.add.circle(this.player.x,this.player.y-55,8,col,0.5)
          this.tweens.add({targets:burst,alpha:0,scaleX:3,scaleY:3,duration:100,onComplete:()=>burst.destroy()})
          // Twin shot at higher levels
          if(this.level>=3){
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
          // Triple at higher level
          if(this.level>=5){
            const b3=this.add.container(this.player.x,this.player.y-55)
            const g3=this.add.graphics(); g3.fillStyle(0xFF6EC7,1); g3.fillRect(-4,-14,8,28)
            b3.add([g3]);(b3 as any).col=0xFF6EC7;(b3 as any).dmg=2
            this.bullets.add(b3)
          }
        }

        // Enemy spawn
        this.enemyTimer+=delta
        const eInterval=Math.max(400,2000-this.level*80)
        if(this.enemyTimer>eInterval){ this.enemyTimer=0; this.spawnEnemy(Phaser.Math.Between(0,4)) }

        // Obstacle spawn
        this.obstTimer+=delta
        const oInterval=Math.max(1500,4000-this.level*200)
        if(this.obstTimer>oInterval){ this.obstTimer=0; this.spawnObstacle(Phaser.Math.Between(0,4)) }

        // Coin spawn
        this.coinTimer+=delta
        if(this.coinTimer>400){ this.coinTimer=0; this.spawnCoin(Phaser.Math.Between(0,4)) }

        // Supply drop spawn
        this.supplyTimer+=delta
        if(this.supplyTimer>Phaser.Math.Between(8000,15000)){
          this.supplyTimer=0
          this.spawnSupplyDrop()
        }

        // Enemy lasers
        this.laserTimer+=delta
        if(this.laserTimer>Math.max(1200,3000-this.level*150)){
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

        // Ambient lightning strike (visual only)
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

        // Combo decay
        if(this.combo>0){
          this.comboTimer+=delta
          if(this.comboTimer>2000){ this.combo=0; this.comboTimer=0 }
        }
        // Power-up timers
        if(this.magnet){ this.magnetTimer-=delta; if(this.magnetTimer<=0){ this.magnet=false } }
        if(this.doubleScore){ this.doubleTimer-=delta; if(this.doubleTimer<=0){ this.doubleScore=false } }

        const eSpeed=(1.2+this.level*0.18)*this.speedMult

        // Bullets move & hit
        this.bullets.getChildren().forEach((b:any)=>{
          if(!b.active) return
          b.y-=9
          if(this.magnet){
            this.coinGroup.getChildren().forEach((coin:any)=>{
              if(!coin.active) return
              const dx=this.player.x-coin.x, dy=this.player.y-coin.y
              const dist=Math.sqrt(dx*dx+dy*dy)
              if(dist<180){ coin.x+=dx*0.08; coin.y+=dy*0.08 }
            })
          }
          if(b.y<70){b.destroy();return}

          // vs enemies
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

          // vs obstacles
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

        // Supply drop spawn
        this.supplyTimer+=delta
        if(this.supplyTimer>Phaser.Math.Between(8000,15000)){
          this.supplyTimer=0
          this.spawnSupplyDrop()
        }

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

    const GW = Math.min(window.innerWidth - 8, 560)
    const GH = Math.round(GW * 700 / 560)
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

  // ── Selection Screen ─────────────────────────────────────────────────────────
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
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                </div>
                <div style={{padding:'3px 4px',background:selCar===i?'rgba(0,234,255,0.1)':'transparent'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:6,color:selCar===i?'#00EAFF':'rgba(255,215,0,0.35)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected preview */}
        <div style={{display:'flex',gap:16,marginBottom:24,padding:'12px 16px',border:'1px solid rgba(200,150,12,0.2)',background:'rgba(5,10,14,0.8)'}}>
          <img src={`/characters/${CHARACTERS[selChar].img}`} style={{width:48,height:64,objectFit:'cover',objectPosition:'top',border:'1px solid rgba(162,89,255,0.4)'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
          <img src={`/cars/${CARS[selCar].img}`} style={{width:64,height:48,objectFit:'contain',alignSelf:'center',filter:'drop-shadow(0 0 6px #00EAFF)'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
          <div style={{flex:1}}>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:11,color:'#FFD700',marginBottom:4}}>{CHARACTERS[selChar].name}</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#39FF14',marginBottom:2}}>COIN BONUS: {CHARACTERS[selChar].coins}</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#00EAFF'}}>VEHICLE: {CARS[selCar].name}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:4,justifyContent:'center'}}>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'rgba(255,215,0,0.4)'}}>17 ENEMY TOKENS</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'rgba(57,255,20,0.4)'}}>4 ROAD OBSTACLES</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:7,color:'rgba(162,89,255,0.4)'}}>∞ LEVELS</div>
          </div>
        </div>

        <div style={{textAlign:'center'}}>
          <button onClick={()=>setStarted(true)} className="cl-btn cl-btn-gold" style={{fontSize:14,padding:'15px 56px',letterSpacing:4}}>
            ▶ START GAME
          </button>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.2)',marginTop:12,letterSpacing:2}}>
            ← → ARROWS / A D · AUTO FIRE · R RESTART · BIRDS & THUNDER INCLUDED
          </div>
        </div>
      </div>
    )
  }

  // ── Game Screen ──────────────────────────────────────────────────────────────
  return (
    <div className="cyber-bg" style={{padding:'14px',display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div style={{marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',maxWidth:560}}>
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
      <div ref={containerRef} style={{border:'1px solid rgba(200,150,12,0.35)',boxShadow:'0 0 40px rgba(57,255,20,0.08)',width:'100%',maxWidth:560,touchAction:'manipulation'}}/>

      {/* MOBILE TOUCH CONTROLS */}
      <div style={{display:('ontouchstart' in window)?'flex':'none',justifyContent:'space-between',alignItems:'center',width:'100%',maxWidth:560,marginTop:10,padding:'0 8px',userSelect:'none'}}>
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
