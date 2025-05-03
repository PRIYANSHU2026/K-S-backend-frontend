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
import { Inbox, Loader2, Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  ContactSubmission,
  getAllContactSubmissions,
  deleteContactSubmission
} from '@/services/contact.service';

const ContactSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [submissionsCount, setSubmissionsCount] = useState<number>(0);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const result = await getAllContactSubmissions(page, 10);
      if (result.success) {
        setSubmissions(result.data.submissions);
        setTotalPages(result.data.pagination.pages);
        setSubmissionsCount(result.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact form submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page]);

  const handleViewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSubmission) return;

    try {
      const result = await deleteContactSubmission(selectedSubmission.id);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Contact form submission deleted successfully',
        });
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact form submission',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contact Form Submissions</h2>
        <p className="text-muted-foreground">
          Manage customer inquiries and messages submitted through the contact form.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>
            Showing {submissions.length} of {submissionsCount} total submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Submissions Yet</h3>
              <p className="text-sm text-muted-foreground">
                There are no contact form submissions to display.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          {formatDate(submission.timestamp)}
                        </TableCell>
                        <TableCell className="font-medium">{submission.user_name}</TableCell>
                        <TableCell>{submission.user_email}</TableCell>
                        <TableCell>
                          {submission.subject || 'General Inquiry'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSubmission(submission)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteConfirm(submission)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Submission Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Form Submission</DialogTitle>
            <DialogDescription>
              Submitted on {selectedSubmission && formatDate(selectedSubmission.timestamp)}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                  <p className="text-base font-medium">{selectedSubmission.user_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p className="text-base">{selectedSubmission.user_email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                  <p className="text-base">{selectedSubmission.user_phone || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Subject</h4>
                  <p className="text-base">{selectedSubmission.subject || 'General Inquiry'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Message</h4>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-base whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact form submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSubmissions;
