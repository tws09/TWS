import React from 'react';
import desktopAvif from '../assets/housesbase-platform-workspace.avif';
import desktopWebp from '../assets/housesbase-platform-workspace.webp';
import mobileAvif from '../assets/housesbase-platform-workspace-mobile.avif';
import mobileWebp from '../assets/housesbase-platform-workspace-mobile.webp';

const PlatformWorkspacePicture = ({ priority = false, className = '' }) => (
  <picture className={`mk-platform-picture ${className}`.trim()}>
    <source media="(max-width: 767px)" srcSet={mobileAvif} type="image/avif" />
    <source media="(max-width: 767px)" srcSet={mobileWebp} type="image/webp" />
    <source srcSet={desktopAvif} type="image/avif" />
    <source srcSet={desktopWebp} type="image/webp" />
    <img
      src={desktopWebp}
      alt="HousesBase company workspace connecting active projects, team capacity, client work, finance, documents and Nucleus assistance"
      width="1800"
      height="1200"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
    />
  </picture>
);

export default PlatformWorkspacePicture;
