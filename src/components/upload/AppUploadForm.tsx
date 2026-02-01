"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Link, Package, Store, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";

const appSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  shortDescription: z.string().min(10, "Too short").max(200),
  description: z.string().min(10, "Too short").max(5000),
  category: z.string().min(1, "Please select a category"),
  submissionType: z.enum(["package", "link", "store"]),
  downloadUrl: z.string().url("Must be a valid URL"),
  iconUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
});

type AppFormData = z.infer<typeof appSchema>;

const steps = [
  { id: "basic", label: "Basic Info" },
  { id: "details", label: "Details" },
  { id: "submit", label: "Submit" },
];

export function AppUploadForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { categories, isLoading: categoriesLoading } = useCategories("app");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconInputType, setIconInputType] = useState<"url" | "upload">("url");
  const [iconUrl, setIconUrl] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppFormData>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      submissionType: "link",
    },
  });

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !watch("category")) {
      setValue("category", categories[0].name);
    }
  }, [categories, setValue, watch]);

  const submissionType = watch("submissionType");

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: AppFormData) => {
    if (!session) {
      toast.error("Please sign in to submit an app");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tags,
          iconUrl: iconUrl || undefined,
        }),
      });

      if (response.ok) {
        toast.success("App submitted successfully!");
        router.push("/");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to submit app");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: index <= currentStep ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  color: index <= currentStep ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm"
              >
                {index + 1}
              </motion.div>
              <span className={`ml-2 text-sm font-medium ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-12 h-0.5 mx-4 bg-muted" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">App Name</Label>
                  <Input
                    id="title"
                    placeholder="Enter your app name"
                    {...register("title")}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  {categoriesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select onValueChange={(value) => setValue("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Label>Submission Type</Label>
                  <Tabs
                    defaultValue="link"
                    onValueChange={(value) => setValue("submissionType", value as any)}
                    className="mt-2"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="link" className="gap-2">
                        <Link className="h-4 w-4" />
                        Link
                      </TabsTrigger>
                      <TabsTrigger value="package" className="gap-2">
                        <Package className="h-4 w-4" />
                        Package
                      </TabsTrigger>
                      <TabsTrigger value="store" className="gap-2">
                        <Store className="h-4 w-4" />
                        Store
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="downloadUrl">
                    {submissionType === "link" && "App URL"}
                    {submissionType === "package" && "Package URL"}
                    {submissionType === "store" && "Store URL"}
                  </Label>
                  <Input
                    id="downloadUrl"
                    placeholder={
                      submissionType === "link"
                        ? "https://your-app.com"
                        : submissionType === "package"
                        ? "https://storage.com/app.zip"
                        : "https://play.google.com/store/apps/..."
                    }
                    {...register("downloadUrl")}
                    className={errors.downloadUrl ? "border-destructive" : ""}
                  />
                  {errors.downloadUrl && (
                    <p className="text-sm text-destructive mt-1">{errors.downloadUrl.message}</p>
                  )}
                </div>

                <div>
                  <Label>App Icon</Label>
                  <Tabs
                    value={iconInputType}
                    onValueChange={(value) => setIconInputType(value as "url" | "upload")}
                    className="mt-2"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url" className="gap-2">
                        <Link className="h-4 w-4" />
                        Image URL
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-3">
                      <Input
                        placeholder="https://example.com/icon.png"
                        value={iconUrl}
                        onChange={(e) => {
                          setIconUrl(e.target.value);
                          setIconPreview(e.target.value);
                        }}
                      />
                    </TabsContent>
                    <TabsContent value="upload" className="mt-3">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload coming soon - use Image URL for now
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  {iconPreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden border bg-muted">
                        <img
                          src={iconPreview}
                          alt="Icon preview"
                          className="h-full w-full object-cover"
                          onError={() => setIconPreview(null)}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Icon preview
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIconUrl("");
                          setIconPreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Brief description (max 200 chars)"
                    maxLength={200}
                    {...register("shortDescription")}
                    className={errors.shortDescription ? "border-destructive" : ""}
                  />
                  {errors.shortDescription && (
                    <p className="text-sm text-destructive mt-1">{errors.shortDescription.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of your app"
                    rows={6}
                    {...register("description")}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label>Tags (max 5)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Ready to Submit</h3>
                <p className="text-muted-foreground">
                  Your app will be reviewed by our moderators before going live.
                </p>
              </motion.div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  className="ml-auto"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit App"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}