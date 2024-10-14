interface BadgeProps {
  url: string
  logoUrl: string
}

const Badge = ({ url, logoUrl }: BadgeProps) => (
  <div className='entries-badge'>
    <a href={url} target='_blank' rel='noopener noreferrer'>
      <img className='entries-badge-image' src={logoUrl} height={50} />
    </a>
  </div>
)

export default Badge
