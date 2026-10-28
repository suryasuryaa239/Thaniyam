import React from 'react';
import { SOCIAL_LINKS } from '../config/social';
import { useLanguage } from '../context/LanguageContext';

const Icon = ({ children }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {children}
  </svg>
);

const ITEMS = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <Icon>
        <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
      </Icon>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: (
      <Icon>
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.78 2 12 2 12s0 3.22.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.22 22 12 22 12s0-3.22-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </Icon>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <Icon>
        <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.4-1.7 1.8-1.7H17V3.8C16.6 3.7 15.6 3.6 14.5 3.6c-2.5 0-4.2 1.5-4.2 4.3v2.6H7.5v3.3h2.8V22h3.2Z" />
      </Icon>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <Icon>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.55h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.15c0-1.23-.02-2.8-1.7-2.8-1.7 0-1.97 1.33-1.97 2.7V21h-4V9.75Z" />
      </Icon>
    ),
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: (
      <Icon>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
      </Icon>
    ),
  },
];

export default function SocialRail() {
  const { lang } = useLanguage();
  const active = ITEMS.filter((i) => SOCIAL_LINKS[i.key]);
  if (active.length === 0) return null;

  const whatsapp = SOCIAL_LINKS.whatsapp;

  return (
    <>
      <aside className="social-rail" aria-label="Social media links">
        {active.map((item) => (
          <a
            key={item.key}
            href={SOCIAL_LINKS[item.key]}
            target="_blank"
            rel="noopener noreferrer"
            className={`social-rail-btn social-${item.key}`}
            aria-label={item.label}
          >
            {item.icon}
          </a>
        ))}
      </aside>

      {whatsapp && (
        <a
          className="chat-widget"
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
        >
          <span className="chat-widget-label">{lang === 'ta' ? 'எங்களுடன் பேசுங்கள் 👋' : 'Chat with us 👋'}</span>
          <span className="chat-widget-bubble" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
          </span>
        </a>
      )}
    </>
  );
}
