import { createFileRoute } from "@tanstack/react-router";
import PropertyDetailsPage from "@/components/PropertyDetailsPage";

export const Route = createFileRoute('/property/$id')({
  parseParams: (params) => ({
    id: params.id,
  }),
  component: PropertyDetailsPage,
}); 