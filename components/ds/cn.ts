// cx — class name joiner for the DS components.
//
// clsx flattens/filters the arguments; tailwind-merge then resolves conflicts so
// a caller-supplied `className` can override a component's own classes (last one
// wins), which plain concatenation cannot do.
//
// tailwind-merge only knows Tailwind's default scales, and the DS theme in
// global.css renames several of them. Without the `extend` below, tailwind-merge
// cannot tell our custom font sizes from text colors — both look like `text-*` —
// and silently drops the size: `cx("text-h1", "text-text")` would emit only
// `text-text`. Every scale here must stay in sync with @theme in global.css.
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // --text-* in global.css. `sm`/`xs` are omitted: tailwind-merge already
      // recognises them as t-shirt sizes.
      "font-size": [
        {
          text: [
            "display-2xl",
            "display-xl",
            "display-lg",
            "display-md",
            "h1",
            "h2",
            "h3",
            "h4",
            "body-lg",
            "body",
          ],
        },
      ],
      // --radius-pill; the other radii match Tailwind's default names.
      rounded: [{ rounded: ["pill"] }],
    },
  },
});

export const cx = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
