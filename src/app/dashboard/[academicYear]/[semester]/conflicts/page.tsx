"use client";

import React from "react";
import ConflictDetector from "./component/ConflictDetector";

export default function ConflictsPage() {
  return (
    <div className="flex flex-col gap-3 my-5">
      <ConflictDetector />
    </div>
  );
}
