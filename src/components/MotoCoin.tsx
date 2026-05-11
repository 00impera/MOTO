export default function MotoCoin({size=48}:{size?:number}) {
  return (
    <img
      src="/moto_coin.gif"
      width={size}
      height={size}
      alt="MOTO"
      style={{flexShrink:0, borderRadius:'50%'}}
    />
  )
}
