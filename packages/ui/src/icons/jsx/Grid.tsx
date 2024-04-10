import * as React from "react";
import type { SVGProps } from "react";
const SvgGrid = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16px"
    height="16px"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fill="currentColor"
      d="M2.402 7.395h3.29c1.14 0 1.703-.555 1.703-1.727V2.426c0-1.172-.563-1.727-1.704-1.727H2.402C1.254.7.7 1.254.7 2.426v3.242c0 1.172.555 1.727 1.703 1.727m7.907 0h3.297c1.14 0 1.695-.555 1.695-1.727V2.426c0-1.172-.555-1.727-1.696-1.727H10.31c-1.141 0-1.704.555-1.704 1.727v3.242c0 1.172.563 1.727 1.704 1.727M2.402 6.09c-.273 0-.398-.14-.398-.422v-3.25c0-.281.125-.422.398-.422h3.282q.408 0 .406.422v3.25q.002.422-.406.422zm7.914 0q-.408 0-.406-.422v-3.25q-.002-.422.406-.422h3.282q.408 0 .406.422v3.25q.002.422-.406.422zM2.402 15.3h3.29c1.14 0 1.703-.554 1.703-1.726v-3.242c0-1.172-.563-1.727-1.704-1.727H2.402C1.254 8.605.7 9.16.7 10.332v3.242c0 1.172.555 1.727 1.703 1.727m7.907 0h3.297c1.14 0 1.695-.554 1.695-1.726v-3.242c0-1.172-.555-1.727-1.696-1.727H10.31c-1.141 0-1.704.555-1.704 1.727v3.242c0 1.172.563 1.727 1.704 1.727m-7.907-1.304c-.273 0-.398-.133-.398-.414v-3.25c0-.289.125-.422.398-.422h3.282c.273 0 .406.133.406.422v3.25c0 .281-.133.414-.406.414zm7.914 0c-.273 0-.406-.133-.406-.414v-3.25c0-.289.133-.422.406-.422h3.282c.273 0 .406.133.406.422v3.25c0 .281-.133.414-.406.414z"
      style={{
        mixBlendMode: "luminosity",
      }}
    />
  </svg>
);
export default SvgGrid;