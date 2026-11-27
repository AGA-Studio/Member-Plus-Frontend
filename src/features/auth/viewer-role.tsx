"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserRole } from "@/lib/domain";

const ViewerRoleContext = createContext<UserRole>("admin");

export function ViewerRoleProvider({ role, children }: { role: UserRole; children: ReactNode }) {
  return <ViewerRoleContext.Provider value={role}>{children}</ViewerRoleContext.Provider>;
}

export function useViewerRole(): UserRole {
  return useContext(ViewerRoleContext);
}
