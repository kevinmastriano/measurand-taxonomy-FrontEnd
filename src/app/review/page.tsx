'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Lock, Check, X, Eye, FileText, Clock, CheckCircle, XCircle, RotateCcw, User, ArrowLeft } from 'lucide-react';
import { PendingMeasurand, Taxon } from '@/types/taxonomy';
import { toast } from 'sonner';
import Link from 'next/link';

const REVIEW_PASSWORD = 'secret';

interface ExtendedPendingMeasurand extends Omit<PendingMeasurand, 'submittedAt'> {
  submittedAt: string; // JSON serialized date
  xmlContent: string;
}

export default function ReviewPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingMeasurands, setPendingMeasurands] = useState<ExtendedPendingMeasurand[]>([]);
  const [selectedMeasurand, setSelectedMeasurand] = useState<ExtendedPendingMeasurand | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  // Load pending measurands from localStorage
  useEffect(() => {
    if (authenticated) {
      const stored = localStorage.getItem('pendingMeasurands');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPendingMeasurands(parsed);
        } catch (error) {
          console.error('Error parsing stored measurands:', error);
        }
      }
      
      // Load saved reviewer name
      const savedReviewer = localStorage.getItem('reviewerName');
      if (savedReviewer) {
        setReviewerName(savedReviewer);
      }
    }
  }, [authenticated]);

  // Save reviewer name to localStorage when it changes
  useEffect(() => {
    if (reviewerName && authenticated) {
      localStorage.setItem('reviewerName', reviewerName);
    }
  }, [reviewerName, authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === REVIEW_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
      toast.success('Access granted');
    } else {
      toast.error('Incorrect password');
    }
  };

  const updateMeasurandStatus = (id: string, status: 'approved' | 'rejected', notes?: string) => {
    if (!reviewerName.trim()) {
      toast.error('Please enter reviewer name');
      return;
    }

    const updated = pendingMeasurands.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status,
          reviewNotes: notes || '',
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewerName.trim()
        };
      }
      return m;
    });

    setPendingMeasurands(updated);
    localStorage.setItem('pendingMeasurands', JSON.stringify(updated));

    if (status === 'approved') {
      // In a real app, this would add to the main taxonomy
      toast.success('Measurand approved and added to taxonomy');
    } else {
      toast.success('Measurand rejected');
    }

    setSelectedMeasurand(null);
    setReviewNotes('');
  };

  const openReviewModal = (measurand: ExtendedPendingMeasurand) => {
    setSelectedMeasurand(measurand);
    // Pre-populate notes if re-reviewing
    if (measurand.reviewNotes) {
      setReviewNotes(measurand.reviewNotes);
    } else {
      setReviewNotes('');
    }
  };

  const openViewModal = (measurand: ExtendedPendingMeasurand) => {
    setSelectedMeasurand(measurand);
    setReviewNotes(''); // Clear notes for view-only
  };

  const renderTaxonDetails = (taxon: Taxon) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold">Basic Information</h4>
        <div className="mt-2 space-y-2">
          <div><strong>Name:</strong> {taxon.name}</div>
          <div><strong>Definition:</strong> {taxon.definition || 'N/A'}</div>
          <div><strong>Deprecated:</strong> {taxon.deprecated ? 'Yes' : 'No'}</div>
          {taxon.replacement && (
            <div><strong>Replacement:</strong> {taxon.replacement}</div>
          )}
        </div>
      </div>

      {taxon.result && (
        <div>
          <h4 className="font-semibold">Result</h4>
          <div className="mt-2 space-y-1">
            <div><strong>Quantity:</strong> {taxon.result.quantity?.name || 'N/A'}</div>
            {taxon.result.mLayer && (
              <div><strong>M-Layer:</strong> {taxon.result.mLayer.aspect} (ID: {taxon.result.mLayer.id})</div>
            )}
          </div>
        </div>
      )}

      {taxon.disciplines && taxon.disciplines.length > 0 && (
        <div>
          <h4 className="font-semibold">Disciplines</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {taxon.disciplines.map(discipline => (
              <Badge key={discipline.name} variant="outline">
                {discipline.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {taxon.parameters && taxon.parameters.length > 0 && (
        <div>
          <h4 className="font-semibold">Parameters</h4>
          <div className="mt-2 space-y-3">
            {taxon.parameters.map((param, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <strong>{param.name}</strong>
                  <Badge variant={param.optional ? 'secondary' : 'default'} size="sm">
                    {param.optional ? 'Optional' : 'Required'}
                  </Badge>
                </div>
                {param.definition && (
                  <div className="text-sm text-muted-foreground mb-2">{param.definition}</div>
                )}
                <div className="text-sm">
                  <strong>Quantity:</strong> {param.quantity?.name || 'N/A'}
                  {param.mLayer && (
                    <span> | <strong>M-Layer:</strong> {param.mLayer.aspect}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="mb-6 text-center">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Taxonomy
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Review Access</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the password to access the measurand review system
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Access Review System
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const pendingCount = pendingMeasurands.filter(m => m.status === 'pending').length;
  const approvedCount = pendingMeasurands.filter(m => m.status === 'approved').length;
  const rejectedCount = pendingMeasurands.filter(m => m.status === 'rejected').length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Taxonomy
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Measurand Review System</h1>
          <p className="text-muted-foreground">Review and approve pending measurand submissions</p>
        </div>
        <Button 
          onClick={() => setAuthenticated(false)} 
          variant="outline"
        >
          Logout
        </Button>
      </div>

      {/* Reviewer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Reviewer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="reviewerName">Reviewer Name</Label>
              <Input
                id="reviewerName"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This name will be recorded with all reviews
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{approvedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingMeasurands.filter(m => m.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No pending measurands to review</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            pendingMeasurands
              .filter(m => m.status === 'pending')
              .map(measurand => (
                <Card key={measurand.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{measurand.taxon.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(measurand.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewModal(measurand)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2">
                      {measurand.taxon.definition || 'No definition provided'}
                    </div>
                    <div className="flex items-center gap-2">
                      {measurand.taxon.disciplines?.map(disc => (
                        <Badge key={disc.name} variant="outline" size="sm">
                          {disc.name}
                        </Badge>
                      ))}
                      <Badge variant="secondary" size="sm">
                        {measurand.taxon.parameters?.length || 0} parameters
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {pendingMeasurands.filter(m => m.status === 'approved').length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No approved measurands</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Approved measurands are locked and added to the taxonomy. They cannot be modified.
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {pendingMeasurands
                .filter(m => m.status === 'approved')
                .map(measurand => (
                  <Card key={measurand.id} className="border-green-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {measurand.taxon.name}
                            <Badge variant="default" className="bg-green-600">
                              <Check className="h-3 w-3 mr-1" />Approved
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />Locked
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Approved: {measurand.reviewedAt ? new Date(measurand.reviewedAt).toLocaleString() : 'N/A'}
                            {measurand.reviewedBy && ` by ${measurand.reviewedBy}`}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewModal(measurand)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {measurand.reviewNotes && (
                        <div className="text-sm mb-2">
                          <strong>Approval Notes:</strong> {measurand.reviewNotes}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {measurand.taxon.disciplines?.map(disc => (
                          <Badge key={disc.name} variant="outline" size="sm">
                            {disc.name}
                          </Badge>
                        ))}
                        <Badge variant="secondary" size="sm">
                          {measurand.taxon.parameters?.length || 0} parameters
                        </Badge>
                        <Badge variant="outline" size="sm" className="text-green-600 border-green-300">
                          Added to Taxonomy
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {pendingMeasurands.filter(m => m.status === 'rejected').length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <XCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No rejected measurands</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            pendingMeasurands
              .filter(m => m.status === 'rejected')
              .map(measurand => (
                <Card key={measurand.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {measurand.taxon.name}
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />Rejected
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Reviewed: {measurand.reviewedAt ? new Date(measurand.reviewedAt).toLocaleString() : 'N/A'}
                          {measurand.reviewedBy && ` by ${measurand.reviewedBy}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewModal(measurand)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewModal(measurand)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Re-review
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {measurand.reviewNotes && (
                      <div className="text-sm mb-2">
                        <strong>Rejection Reason:</strong> {measurand.reviewNotes}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {measurand.taxon.disciplines?.map(disc => (
                        <Badge key={disc.name} variant="outline" size="sm">
                          {disc.name}
                        </Badge>
                      ))}
                      <Badge variant="secondary" size="sm">
                        {measurand.taxon.parameters?.length || 0} parameters
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedMeasurand && (
        <AlertDialog open={true} onOpenChange={() => setSelectedMeasurand(null)}>
          <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedMeasurand.status === 'approved' ? 'View Approved Measurand: ' : 'Review Measurand: '}
                {selectedMeasurand.taxon.name}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedMeasurand.status === 'approved' ? (
                  <>
                    This measurand has been approved and added to the taxonomy. It is locked and cannot be modified.
                    <span className="block mt-2 font-medium">
                      Status: <Badge variant="default" className="bg-green-600">
                        <Lock className="h-3 w-3 mr-1" />Approved & Locked
                      </Badge>
                    </span>
                  </>
                ) : (
                  <>
                    Review the details and approve or reject this measurand submission.
                    {selectedMeasurand.status !== 'pending' && (
                      <span className="block mt-2 font-medium">
                        Current Status: <Badge variant={selectedMeasurand.status === 'approved' ? 'default' : 'destructive'}>
                          {selectedMeasurand.status}
                        </Badge>
                      </span>
                    )}
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              {/* Previous Review Info */}
              {selectedMeasurand.status !== 'pending' && selectedMeasurand.reviewedBy && (
                <Card className={selectedMeasurand.status === 'approved' ? 'bg-green-50 border-green-200' : ''}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {selectedMeasurand.status === 'approved' ? 'Approval Details' : 'Previous Review'}
                      {selectedMeasurand.status === 'approved' && <Lock className="h-4 w-4 text-green-600" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <strong>Reviewer:</strong> {selectedMeasurand.reviewedBy}
                    </div>
                    <div className="text-sm">
                      <strong>Date:</strong> {selectedMeasurand.reviewedAt ? new Date(selectedMeasurand.reviewedAt).toLocaleString() : 'N/A'}
                    </div>
                    {selectedMeasurand.reviewNotes && (
                      <div className="text-sm">
                        <strong>{selectedMeasurand.status === 'approved' ? 'Approval Notes:' : 'Notes:'}</strong> {selectedMeasurand.reviewNotes}
                      </div>
                    )}
                    {selectedMeasurand.status === 'approved' && (
                      <div className="text-sm font-medium text-green-700 mt-3 p-2 bg-green-100 rounded">
                        <Lock className="h-4 w-4 inline mr-1" />
                        This measurand has been permanently added to the taxonomy and cannot be modified.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="xml">XML Source</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  {renderTaxonDetails(selectedMeasurand.taxon)}
                </TabsContent>

                <TabsContent value="xml">
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                    {selectedMeasurand.xmlContent}
                  </pre>
                </TabsContent>
              </Tabs>

              {/* Only show review fields for non-approved items */}
              {selectedMeasurand.status !== 'approved' && (
                <>
                  {/* Reviewer Name */}
                  <div>
                    <Label htmlFor="modalReviewerName">Reviewer Name</Label>
                    <Input
                      id="modalReviewerName"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Enter your name"
                      className="mt-1"
                    />
                  </div>

                  {/* Review Notes */}
                  <div>
                    <Label htmlFor="reviewNotes">Review Notes</Label>
                    <Textarea
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add review notes (optional)..."
                      rows={4}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      For rejections, please provide a reason. For approvals, you may add additional comments.
                    </p>
                  </div>
                </>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedMeasurand(null)}>
                {selectedMeasurand.status === 'approved' ? 'Close' : 'Cancel'}
              </AlertDialogCancel>
              {selectedMeasurand.status !== 'approved' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => updateMeasurandStatus(selectedMeasurand.id, 'rejected', reviewNotes)}
                    disabled={!reviewerName.trim()}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {selectedMeasurand.status === 'rejected' ? 'Update as Rejected' : 'Reject'}
                  </Button>
                  <AlertDialogAction
                    onClick={() => updateMeasurandStatus(selectedMeasurand.id, 'approved', reviewNotes)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!reviewerName.trim()}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {selectedMeasurand.status === 'approved' ? 'Update as Approved' : 'Approve'}
                  </AlertDialogAction>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
} 