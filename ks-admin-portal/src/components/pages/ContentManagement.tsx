import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Edit,
  FileText,
  Loader2,
  PlusCircle,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  WebsiteContent,
  getAllContent,
  updateContent,
  createContent
} from '@/services/content.service';
import { useForm } from 'react-hook-form';

// Define a simple rich text editor component (basic textarea for this demo)
const SimpleEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <textarea
      className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const ContentManagement: React.FC = () => {
  const [contents, setContents] = useState<WebsiteContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isNewContent, setIsNewContent] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<{
    section: string;
    title: string;
    content: string;
    metadata: string;
  }>({
    defaultValues: {
      section: '',
      title: '',
      content: '',
      metadata: '{}',
    },
  });

  const fetchContents = async () => {
    try {
      setLoading(true);
      const result = await getAllContent();
      if (result.success) {
        setContents(result.data);
      }
    } catch (error) {
      console.error('Error fetching website content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load website content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleEditContent = (content: WebsiteContent) => {
    setSelectedContent(content);
    setIsNewContent(false);

    let metadata = content.metadata || '{}';
    if (typeof metadata === 'object') {
      metadata = JSON.stringify(metadata, null, 2);
    }

    form.reset({
      section: content.section,
      title: content.title,
      content: content.content,
      metadata,
    });

    setDialogOpen(true);
  };

  const handleAddContent = () => {
    setSelectedContent(null);
    setIsNewContent(true);
    form.reset({
      section: '',
      title: '',
      content: '',
      metadata: '{}',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      let parsedMetadata;
      try {
        parsedMetadata = JSON.parse(data.metadata);
      } catch (e) {
        parsedMetadata = {};
        toast({
          title: 'Warning',
          description: 'Invalid JSON in metadata field. Using empty object instead.',
          variant: 'destructive',
        });
      }

      const contentData = {
        section: data.section,
        title: data.title,
        content: data.content,
        metadata: parsedMetadata,
      };

      let result;
      if (isNewContent) {
        result = await createContent(contentData);
      } else if (selectedContent) {
        result = await updateContent(selectedContent.id, contentData);
      }

      if (result && result.success) {
        toast({
          title: 'Success',
          description: isNewContent
            ? 'New content created successfully'
            : 'Content updated successfully',
        });
        fetchContents();
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isNewContent ? 'create' : 'update'} content`,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Website Content Management</h2>
          <p className="text-muted-foreground">
            Edit and manage content displayed on the public website.
          </p>
        </div>
        <Button onClick={handleAddContent}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Sections</CardTitle>
          <CardDescription>
            Manage various sections of content displayed throughout the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Content Sections</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There are no content sections set up yet.
              </p>
              <Button onClick={handleAddContent}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Section
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{content.section}</TableCell>
                      <TableCell>{content.title}</TableCell>
                      <TableCell>
                        {content.updated_at ? formatDate(content.updated_at) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditContent(content)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isNewContent ? 'Add New Content Section' : 'Edit Content'}
            </DialogTitle>
            <DialogDescription>
              {isNewContent
                ? 'Create a new content section to be displayed on the website'
                : `Editing content section: ${selectedContent?.section}`}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., about_us, home_banner"
                        {...field}
                        disabled={!isNewContent}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Content title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (HTML)</FormLabel>
                    <FormControl>
                      <SimpleEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metadata (JSON)</FormLabel>
                    <FormControl>
                      <textarea
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                        placeholder="{}"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex items-center text-xs text-amber-600 mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Enter as valid JSON. Example: {"{ \"key\": \"value\" }"}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {isNewContent ? 'Create' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;
