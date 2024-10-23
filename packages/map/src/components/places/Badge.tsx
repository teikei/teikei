interface BadgeProps {
  name?: string
  url: string
  logoUrl: string
}

const Badge = ({ name = '', url, logoUrl }: BadgeProps) => (
  <div className='entries-badge'>
    <div>{name}</div>
    <a href={url} target='_blank' rel='noopener noreferrer'>
      <img className='entries-badge-image' src={logoUrl} height={50} />
    </a>
  </div>
)

export default Badge
