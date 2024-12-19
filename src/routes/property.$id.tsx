import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PropertyDetailsPage from "@/components/PropertyDetailsPage";

export const Route = createFileRoute('/property/$id')({
  component: PropertyDetailsPage
}); 