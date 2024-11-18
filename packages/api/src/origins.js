export function getOriginConfiguration(origin) {
  if (/solawi\.ch/.test(origin)) {
    return {
      baseurl: '/vernetzungsplattform/#',
      origin: 'https://solawi.ch',
      originName: 'Ernte teilen',
      organizationName: 'Netzwerk Solidarische Landwirtschaft e.V.',
      organizationEmail: 'ernteteilen@solidarische-landwirtschaft.org'
    }
  }
  if (/fracp\.ch/.test(origin)) {
    return {
      baseurl: '/#',
      origin: 'https://map.fracp.ch',
      originName: 'map.fracp.ch',
      organizationName: 'FRACP',
      organizationEmail: 'info@fracp.ch'
    }
  }
  if (/solidarische-landwirtschaft\.org/.test(origin)) {
    return {
      baseurl: '/solawis-finden/karte/#',
      origin: 'https://www.solidarische-landwirtschaft.org',
      originName: 'Ernte teilen',
      organizationName: 'Netzwerk Solidarische Landwirtschaft e.V.',
      organizationEmail: 'ernteteilen@solidarische-landwirtschaft.org'
    }
  }
  if (/preview\.ernte-teilen\.org/.test(origin)) {
    return {
      baseurl: '/karte/#',
      origin: 'https://preview.ernte-teilen.org',
      originName: 'Ernte teilen',
      organizationName: 'Netzwerk Solidarische Landwirtschaft e.V.',
      organizationEmail: 'ernteteilen@solidarische-landwirtschaft.org'
    }
  }
  // ernte-teilen.org
  return {
    baseurl: '/karte/#',
    origin: 'https://ernte-teilen.org',
    originName: 'Ernte teilen',
    organizationName: 'Netzwerk Solidarische Landwirtschaft e.V.',
    organizationEmail: 'ernteteilen@solidarische-landwirtschaft.org'
  }
}
