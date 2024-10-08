import timeago from 'timeago'

interface FooterProps {
  feature: {
    updatedAt: string
  }
}

const Footer = ({ feature }: FooterProps) => (
  <footer>
    Letzte Aktualisierung:
    {timeago(feature.updatedAt)}
  </footer>
)

export default Footer
