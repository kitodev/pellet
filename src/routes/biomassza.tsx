import { createFileRoute, Outlet } from "@tanstack/react-router";

// /biomassza – information page (index); old /biomassza/<x> URLs redirect to the new categories.
export const Route = createFileRoute("/biomassza")({ component: Outlet });
