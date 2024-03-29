import React from 'react'

export type SvgIconProps = React.SVGProps<SVGSVGElement>

const icons = {
  copy: (props: SvgIconProps) => (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="transparent" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.5623 11.5397V2.43768H4.45996"
        stroke="white"
        strokeWidth="1.01132"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.54 4.46045H2.43774V13.5624H11.54V4.46045Z"
        stroke="white"
        strokeWidth="1.01132"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowDown: (props: SvgIconProps) => (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path
          d="M3.66895 6.08838C3.66895 6.24951 3.72754 6.38135 3.83496 6.49365L7.5459 10.2925C7.68262 10.4243 7.82422 10.4927 8 10.4927C8.1709 10.4927 8.32227 10.4292 8.44922 10.2925L12.165 6.49365C12.2725 6.38135 12.3311 6.24951 12.3311 6.08838C12.3311 5.76123 12.0771 5.50732 11.7549 5.50732C11.5986 5.50732 11.4473 5.57568 11.335 5.68311L7.99512 9.10596L4.66504 5.68311C4.54785 5.5708 4.40625 5.50732 4.24512 5.50732C3.92285 5.50732 3.66895 5.76123 3.66895 6.08838Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
  checked: (props: SvgIconProps) => (
    <svg {...props} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.5 5.00037L6.5 12.0001L3 8.50037"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  more: (props: SvgIconProps) => (
    <svg {...props} width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5625 8C4.5625 8.72487 3.97487 9.3125 3.25 9.3125C2.52513 9.3125 1.9375 8.72487 1.9375 8C1.9375 7.27513 2.52513 6.6875 3.25 6.6875C3.97487 6.6875 4.5625 7.27513 4.5625 8ZM9.8125 8C9.8125 8.72487 9.22487 9.3125 8.5 9.3125C7.77513 9.3125 7.1875 8.72487 7.1875 8C7.1875 7.27513 7.77513 6.6875 8.5 6.6875C9.22487 6.6875 9.8125 7.27513 9.8125 8ZM13.75 9.3125C14.4749 9.3125 15.0625 8.72487 15.0625 8C15.0625 7.27513 14.4749 6.6875 13.75 6.6875C13.0251 6.6875 12.4375 7.27513 12.4375 8C12.4375 8.72487 13.0251 9.3125 13.75 9.3125Z"
        fill="currentColor"
      />
    </svg>
  ),
  regenerate: (props: SvgIconProps) => (
    <svg {...props} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.0105 6.73242H14.0105V3.73242" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4.11084 4.61091C4.62156 4.10019 5.22788 3.69506 5.89517 3.41866C6.56246 3.14226 7.27766 3 7.99993 3C8.7222 3 9.4374 3.14226 10.1047 3.41866C10.772 3.69506 11.3783 4.10019 11.889 4.61091L14.0103 6.73223"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.9895 10.2676H1.9895V13.2676" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M11.889 12.3891C11.3783 12.8999 10.772 13.305 10.1047 13.5814C9.43738 13.8578 8.72218 14.0001 7.99991 14.0001C7.27764 14.0001 6.56244 13.8578 5.89515 13.5814C5.22786 13.305 4.62154 12.8999 4.11082 12.3891L1.9895 10.2678"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowUpLeft: (props: SvgIconProps) => (
    <svg {...props} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 9L2 6L5 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5 13H10.5C11.4283 13 12.3185 12.6313 12.9749 11.9749C13.6313 11.3185 14 10.4283 14 9.5V9.49999C14 9.04037 13.9095 8.58524 13.7336 8.1606C13.5577 7.73596 13.2999 7.35013 12.9749 7.02512C12.6499 6.70012 12.264 6.44231 11.8394 6.26642C11.4148 6.09053 10.9596 6 10.5 6H2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (props: SvgIconProps) => (
    <svg {...props} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.8125 3.93784L5.6875 10.0626L2.625 7.00034"
        stroke="currentColor"
        strokeWidth="0.84375"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (props: SvgIconProps) => (
    <svg {...props} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.75314 2.75314C2.924 2.58229 3.201 2.58229 3.37186 2.75314L7 6.38128L10.6281 2.75314C10.799 2.58229 11.076 2.58229 11.2469 2.75314C11.4177 2.924 11.4177 3.201 11.2469 3.37186L7.61872 7L11.2469 10.6281C11.4177 10.799 11.4177 11.076 11.2469 11.2469C11.076 11.4177 10.799 11.4177 10.6281 11.2469L7 7.61872L3.37186 11.2469C3.201 11.4177 2.924 11.4177 2.75314 11.2469C2.58229 11.076 2.58229 10.799 2.75314 10.6281L6.38128 7L2.75314 3.37186C2.58229 3.201 2.58229 2.924 2.75314 2.75314Z"
        fill="currentColor"
      />
    </svg>
  ),
  loading: (props: SvgIconProps) => (
    <svg {...props} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_154_70728)">
        <path
          d="M13.125 7.49C12.8538 7.49 12.635 7.27125 12.635 7C12.635 6.18625 12.4775 5.39875 12.1625 4.655C11.8563 3.94625 11.4188 3.29 10.8675 2.7475C10.325 2.19625 9.66875 1.75875 8.96 1.4525C8.21625 1.14625 7.42875 0.98 6.615 0.98C6.34375 0.98 6.125 0.76125 6.125 0.49C6.125 0.21875 6.34375 0 6.615 0C7.56 0 8.47875 0.18375 9.33625 0.55125C10.1675 0.90125 10.92 1.40875 11.5588 2.0475C12.1975 2.68625 12.705 3.43875 13.055 4.27C13.4313 5.13625 13.615 6.055 13.615 7C13.615 7.27125 13.3962 7.49 13.125 7.49Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_154_70728">
          <rect width="7.49" height="7.49" fill="white" transform="translate(6.125)" />
        </clipPath>
      </defs>
    </svg>
  ),
  moreVertical: (props: SvgIconProps) => (
    <svg {...props} width="25" height="25" viewBox="0 0 25 25" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5 16.4375C13.2249 16.4375 13.8125 17.0251 13.8125 17.75C13.8125 18.4749 13.2249 19.0625 12.5 19.0625C11.7751 19.0625 11.1875 18.4749 11.1875 17.75C11.1875 17.0251 11.7751 16.4375 12.5 16.4375ZM12.5 11.1875C13.2249 11.1875 13.8125 11.7751 13.8125 12.5C13.8125 13.2249 13.2249 13.8125 12.5 13.8125C11.7751 13.8125 11.1875 13.2249 11.1875 12.5C11.1875 11.7751 11.7751 11.1875 12.5 11.1875ZM13.8125 7.25C13.8125 6.52513 13.2249 5.9375 12.5 5.9375C11.7751 5.9375 11.1875 6.52513 11.1875 7.25C11.1875 7.97487 11.7751 8.5625 12.5 8.5625C13.2249 8.5625 13.8125 7.97487 13.8125 7.25Z"
        fill="currentColor"
      />
    </svg>
  ),
  circleX: (props: SvgIconProps) => (
    <svg {...props} width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 18.5C15.8137 18.5 18.5 15.8137 18.5 12.5C18.5 9.18629 15.8137 6.5 12.5 6.5C9.18629 6.5 6.5 9.18629 6.5 12.5C6.5 15.8137 9.18629 18.5 12.5 18.5Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeMiterlimit="10"
      />
      <path
        d="M14.5 10.5L10.5 14.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 14.5L10.5 10.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  trash: (props: SvgIconProps) => (
    <svg {...props} width="16" height="17" viewBox="0 0 16 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.8645 14.6538H5.1361C4.14729 14.6538 3.34283 13.8494 3.34283 12.8606V4.41486H3.99157V12.8606C3.99157 13.4917 4.50498 14.0051 5.1361 14.0051H10.8645C11.4956 14.0051 12.009 13.4917 12.009 12.8606V4.41486H12.6577V12.8606C12.6577 13.8494 11.8533 14.6538 10.8645 14.6538Z"
        fill="#currentColor"
        stroke="currentColor"
        strokeWidth="0.292685"
      />
      <path
        d="M13.8386 4.73894H2.1614C1.98224 4.73894 1.83704 4.59374 1.83704 4.41458C1.83704 4.23541 1.98224 4.09021 2.1614 4.09021H13.8386C14.0178 4.09021 14.163 4.23541 14.163 4.41458C14.163 4.59374 14.0178 4.73894 13.8386 4.73894Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.292685"
      />
      <path
        d="M10.206 4.41479H9.55726V3.40494C9.55726 3.17884 9.37328 2.99492 9.14724 2.99492H6.85209C6.62605 2.99492 6.44207 3.17884 6.44207 3.40494V4.41479H5.79333V3.40494C5.79333 2.82115 6.26823 2.34619 6.85209 2.34619H9.14724C9.7311 2.34619 10.206 2.82115 10.206 3.40494V4.41479Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.292685"
      />
      <path
        d="M6.28012 12.1668C6.10095 12.1668 5.95575 12.0216 5.95575 11.8425V7.08181C5.95575 6.90265 6.10095 6.75745 6.28012 6.75745C6.45928 6.75745 6.60448 6.90265 6.60448 7.08181V11.8425C6.60448 12.0216 6.45928 12.1668 6.28012 12.1668Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.292685"
      />
      <path
        d="M9.71908 12.1668C9.53992 12.1668 9.39471 12.0216 9.39471 11.8425V7.08181C9.39471 6.90265 9.53992 6.75745 9.71908 6.75745C9.89824 6.75745 10.0434 6.90265 10.0434 7.08181V11.8425C10.0434 12.0216 9.89824 12.1668 9.71908 12.1668Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.292685"
      />
    </svg>
  ),
  cancel: (props: SvgIconProps) => (
    <svg {...props} width="16" height="17" viewBox="0 0 16 17" fill="transparent" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 14.5C11.3137 14.5 14 11.8137 14 8.5C14 5.18629 11.3137 2.5 8 2.5C4.68629 2.5 2 5.18629 2 8.5C2 11.8137 4.68629 14.5 8 14.5Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeMiterlimit="10"
      />
      <path d="M10 6.5L6 10.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 10.5L6 6.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  download: (props: SvgIconProps) => (
    <svg {...props} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.375 7.375L8 10L10.625 7.375"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 2.99817V9.99817"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9V13.5C14 13.6326 13.9473 13.7598 13.8536 13.8536C13.7598 13.9473 13.6326 14 13.5 14H2.5C2.36739 14 2.24021 13.9473 2.14645 13.8536C2.05268 13.7598 2 13.6326 2 13.5V9"
        stroke="currentColor"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  audio: (props: SvgIconProps) => (
    <svg {...props} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 11H2C1.86739 11 1.74021 10.9473 1.64645 10.8536C1.55268 10.7598 1.5 10.6326 1.5 10.5V6.5C1.5 6.36739 1.55268 6.24021 1.64645 6.14645C1.74021 6.05268 1.86739 6 2 6H5L9.5 2.5V14.5L5 11Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 7L12 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 10L12 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrowLeft: (props: SvgIconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ mixBlendMode: 'luminosity' }}>
        <path
          d="M14.4102 18.6641L8.33203 12.7188C8.12109 12.5078 8.01172 12.2734 8.01172 12C8.01172 11.7266 8.12109 11.4766 8.33984 11.2734L14.418 5.33594C14.5898 5.16406 14.8086 5.07031 15.0586 5.07031C15.582 5.07031 15.9883 5.47656 15.9883 5.99219C15.9883 6.24219 15.8867 6.48438 15.707 6.66406L10.2383 11.9922L15.707 17.3359C15.8867 17.5156 15.9883 17.75 15.9883 18.0078C15.9883 18.5234 15.582 18.9297 15.0586 18.9297C14.8086 18.9297 14.5898 18.8359 14.4102 18.6641Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
  arrowRight: (props: SvgIconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ mixBlendMode: 'luminosity' }}>
        <path
          d="M8.94141 18.9297C9.19922 18.9297 9.41016 18.8359 9.58984 18.6641L15.668 12.7266C15.8789 12.5078 15.9883 12.2812 15.9883 12C15.9883 11.7266 15.8867 11.4844 15.668 11.2812L9.58984 5.33594C9.41016 5.16406 9.19922 5.07031 8.94141 5.07031C8.41797 5.07031 8.01172 5.47656 8.01172 5.99219C8.01172 6.24219 8.12109 6.48438 8.29297 6.66406L13.7695 12.0078L8.29297 17.3359C8.11328 17.5234 8.01172 17.75 8.01172 18.0078C8.01172 18.5234 8.41797 18.9297 8.94141 18.9297Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
  grid: (props: SvgIconProps) => (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ mixBlendMode: 'luminosity' }}>
        <path
          d="M2.40234 7.39453H5.69141C6.83203 7.39453 7.39453 6.83984 7.39453 5.66797V2.42578C7.39453 1.25391 6.83203 0.699219 5.69141 0.699219H2.40234C1.25391 0.699219 0.699219 1.25391 0.699219 2.42578V5.66797C0.699219 6.83984 1.25391 7.39453 2.40234 7.39453ZM10.3086 7.39453H13.6055C14.7461 7.39453 15.3008 6.83984 15.3008 5.66797V2.42578C15.3008 1.25391 14.7461 0.699219 13.6055 0.699219H10.3086C9.16797 0.699219 8.60547 1.25391 8.60547 2.42578V5.66797C8.60547 6.83984 9.16797 7.39453 10.3086 7.39453ZM2.40234 6.08984C2.12891 6.08984 2.00391 5.94922 2.00391 5.66797V2.41797C2.00391 2.13672 2.12891 1.99609 2.40234 1.99609H5.68359C5.95703 1.99609 6.08984 2.13672 6.08984 2.41797V5.66797C6.08984 5.94922 5.95703 6.08984 5.68359 6.08984H2.40234ZM10.3164 6.08984C10.043 6.08984 9.91016 5.94922 9.91016 5.66797V2.41797C9.91016 2.13672 10.043 1.99609 10.3164 1.99609H13.5977C13.8711 1.99609 14.0039 2.13672 14.0039 2.41797V5.66797C14.0039 5.94922 13.8711 6.08984 13.5977 6.08984H10.3164ZM2.40234 15.3008H5.69141C6.83203 15.3008 7.39453 14.7461 7.39453 13.5742V10.332C7.39453 9.16016 6.83203 8.60547 5.69141 8.60547H2.40234C1.25391 8.60547 0.699219 9.16016 0.699219 10.332V13.5742C0.699219 14.7461 1.25391 15.3008 2.40234 15.3008ZM10.3086 15.3008H13.6055C14.7461 15.3008 15.3008 14.7461 15.3008 13.5742V10.332C15.3008 9.16016 14.7461 8.60547 13.6055 8.60547H10.3086C9.16797 8.60547 8.60547 9.16016 8.60547 10.332V13.5742C8.60547 14.7461 9.16797 15.3008 10.3086 15.3008ZM2.40234 13.9961C2.12891 13.9961 2.00391 13.8633 2.00391 13.582V10.332C2.00391 10.043 2.12891 9.91016 2.40234 9.91016H5.68359C5.95703 9.91016 6.08984 10.043 6.08984 10.332V13.582C6.08984 13.8633 5.95703 13.9961 5.68359 13.9961H2.40234ZM10.3164 13.9961C10.043 13.9961 9.91016 13.8633 9.91016 13.582V10.332C9.91016 10.043 10.043 9.91016 10.3164 9.91016H13.5977C13.8711 9.91016 14.0039 10.043 14.0039 10.332V13.582C14.0039 13.8633 13.8711 13.9961 13.5977 13.9961H10.3164Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
  list: (props: SvgIconProps) => (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ mixBlendMode: 'luminosity' }}>
        <path
          d="M1.09918 4.33868C1.71069 4.33868 2.19836 3.85101 2.19836 3.2395C2.19836 2.63572 1.71069 2.14032 1.09918 2.14032C0.495404 2.14032 0 2.63572 0 3.2395C0 3.85101 0.495404 4.33868 1.09918 4.33868ZM4.7373 3.9826H15.2492C15.6672 3.9826 16 3.65749 16 3.2395C16 2.8215 15.6749 2.49639 15.2492 2.49639H4.7373C4.32704 2.49639 3.99419 2.8215 3.99419 3.2395C3.99419 3.65749 4.3193 3.9826 4.7373 3.9826ZM1.09918 9.0992C1.71069 9.0992 2.19836 8.61153 2.19836 8.00002C2.19836 7.39625 1.71069 6.90084 1.09918 6.90084C0.495404 6.90084 0 7.39625 0 8.00002C0 8.61153 0.495404 9.0992 1.09918 9.0992ZM4.7373 8.74313H15.2492C15.6672 8.74313 16 8.41802 16 8.00002C16 7.58202 15.6749 7.25691 15.2492 7.25691H4.7373C4.32704 7.25691 3.99419 7.58202 3.99419 8.00002C3.99419 8.41802 4.3193 8.74313 4.7373 8.74313ZM1.09918 13.8597C1.71069 13.8597 2.19836 13.3721 2.19836 12.7605C2.19836 12.1568 1.71069 11.6614 1.09918 11.6614C0.495404 11.6614 0 12.1568 0 12.7605C0 13.3721 0.495404 13.8597 1.09918 13.8597ZM4.7373 13.5036H15.2492C15.6672 13.5036 16 13.1785 16 12.7605C16 12.3425 15.6749 12.0174 15.2492 12.0174H4.7373C4.32704 12.0174 3.99419 12.3425 3.99419 12.7605C3.99419 13.1785 4.3193 13.5036 4.7373 13.5036Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
  column: (props: SvgIconProps) => (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ mixBlendMode: 'luminosity' }}>
        <path
          d="M2.2211 14.3089H13.7722C15.2371 14.3089 16 13.5528 16 12.108V3.89201C16 2.44728 15.2371 1.69116 13.7722 1.69116H2.2211C0.762869 1.69116 0 2.44053 0 3.89201V12.108C0 13.5528 0.762869 14.3089 2.2211 14.3089ZM2.30886 12.9654C1.68776 12.9654 1.34346 12.6414 1.34346 11.9865V4.01353C1.34346 3.35867 1.68776 3.03462 2.30886 3.03462H4.90127V12.9654H2.30886ZM6.21772 12.9654V3.03462H9.78228V12.9654H6.21772ZM13.6844 3.03462C14.3055 3.03462 14.6498 3.35867 14.6498 4.01353V11.9865C14.6498 12.6414 14.3055 12.9654 13.6844 12.9654H11.092V3.03462H13.6844Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
  search: (props: SvgIconProps) => (
    <svg {...props} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.34375 10.9375C8.88081 10.9375 10.9375 8.88081 10.9375 6.34375C10.9375 3.80669 8.88081 1.75 6.34375 1.75C3.80669 1.75 1.75 3.80669 1.75 6.34375C1.75 8.88081 3.80669 10.9375 6.34375 10.9375Z"
        stroke="currentColor"
        strokeWidth="0.875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.59167 9.5921L12.2495 12.2499"
        stroke="currentColor"
        strokeWidth="0.875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  microphone: (props: SvgIconProps) => (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.00017 11.7139C9.89889 11.7139 11.4436 10.1691 11.4436 8.27047V3.94353C11.4436 2.04481 9.89889 0.5 8.00017 0.5C6.10145 0.5 4.55664 2.04481 4.55664 3.94353V8.27047C4.55664 10.1692 6.10145 11.7139 8.00017 11.7139Z" fill="currentColor" fillOpacity="0.95"/>
      <path d="M12.9537 9.70794C13.0008 9.45341 12.8326 9.20891 12.578 9.16175C12.3232 9.1145 12.0789 9.28288 12.0318 9.5375C11.6903 11.3837 9.9948 12.7237 8.00036 12.7237C6.00583 12.7237 4.31036 11.3837 3.96883 9.5375C3.92177 9.28288 3.67708 9.11507 3.42264 9.16175C3.16802 9.20891 2.99983 9.45341 3.04699 9.70794C3.44336 11.8507 5.29192 13.4436 7.53161 13.6404V14.5626H4.32245C4.06361 14.5626 3.8537 14.7724 3.8537 15.0313C3.8537 15.2903 4.06361 15.5001 4.32245 15.5001H11.6782C11.9371 15.5001 12.1469 15.2903 12.1469 15.0313C12.1469 14.7724 11.9371 14.5626 11.6782 14.5626H8.46911V13.6404C10.7088 13.4436 12.5574 11.8507 12.9537 9.70794Z" fill="currentColor" fillOpacity="0.95"/>
    </svg>
  ),
  image: (props: SvgIconProps) => (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M13.875 1.98755H2.125C1.50625 1.98755 1 2.4938 1 3.11255V12.886C1 13.5047 1.50625 14.011 2.125 14.011H13.875C14.4938 14.011 15 13.5047 15 12.886V3.11255C15 2.4938 14.4938 1.98755 13.875 1.98755ZM13.8751 12.8827L13.8735 12.8843H2.12819L2.12663 12.8827V9.55775L5.02663 6.59212L8.42194 10.8093C8.60944 11.0218 8.92507 11.0624 9.15944 10.9031L11.6673 9.20775L13.8751 10.2468V12.8827ZM12.0297 8.07028L13.875 8.83122L13.8734 3.11403L13.8719 3.11247H2.12656L2.125 3.11403V7.9484L4.64375 5.37184C4.75313 5.2609 4.90469 5.1984 5.06094 5.20309C5.21719 5.20778 5.36562 5.27653 5.46875 5.39372L8.93906 9.69372L11.3734 8.05153C11.5734 7.91559 11.8375 7.9234 12.0297 8.07028ZM10.9062 4.26562C10.0359 4.26562 9.32812 4.97344 9.32812 5.84375C9.32812 6.71406 10.0359 7.42188 10.9062 7.42188C11.7766 7.42188 12.4844 6.71406 12.4844 5.84375C12.4844 4.97344 11.7766 4.26562 10.9062 4.26562ZM10.4531 5.84375C10.4531 6.09375 10.6562 6.29688 10.9062 6.29688C11.1562 6.29688 11.3594 6.09375 11.3594 5.84375C11.3594 5.59375 11.1562 5.39062 10.9062 5.39062C10.6562 5.39062 10.4531 5.59375 10.4531 5.84375Z" fill="currentColor"/>
    </svg>
  )
}

export default icons;
