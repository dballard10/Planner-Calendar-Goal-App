import React, { forwardRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import type { ReactCodeMirrorProps, ReactCodeMirrorRef } from "@uiw/react-codemirror";

export type { ReactCodeMirrorProps, ReactCodeMirrorRef };

/**
 * A wrapper for CodeMirror that always forces the "dark" theme wrapper class (cm-theme-dark).
 * This ensures the editor doesn't flicker or render with light-mode default styles
 * even if the rest of the app's theme detection is decoupled.
 */
export const DarkCodeMirror = forwardRef<ReactCodeMirrorRef, Omit<ReactCodeMirrorProps, "theme">>(
  (props, ref) => {
    return <CodeMirror {...props} ref={ref} theme="dark" />;
  }
);

DarkCodeMirror.displayName = "DarkCodeMirror";
