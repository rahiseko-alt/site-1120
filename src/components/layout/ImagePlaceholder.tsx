"use client";

import React from "react";
import { useImagePlaceholderStore } from "@/stores/appStore";

export function ImagePlaceholder() {
  const image = useImagePlaceholderStore((s) => s.image);
  const projectName = useImagePlaceholderStore((s) => s.projectName);

  return (
    <>
      <div
        className={`ImagePlaceholder_wrapper__f5zm_ ${
          image ? "ImagePlaceholder_wrapper__visible__aOXnp" : ""
        }`}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={projectName || ""} />
        )}
      </div>
      {projectName && (
        <div className="ImagePlaceholder_name__K_QaV">{projectName}</div>
      )}
    </>
  );
}
