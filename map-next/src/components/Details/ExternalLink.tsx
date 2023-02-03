import React from "react";

interface Props {
  url: string;
}

const ExternalLink: React.FC<Props> = ({ url }) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {url}
  </a>
);

export default ExternalLink;
