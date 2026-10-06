import React from "react";
import MDXComponents from "@theme-original/MDXComponents";
import DiagramImage from "@site/src/components/DiagramImage";

export default {
  ...MDXComponents,
  img: (props) =>
    props.src?.includes("/diagrams/") ? (
      <DiagramImage {...props} />
    ) : (
      <img {...props} />
    ),
};
