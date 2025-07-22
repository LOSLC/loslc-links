'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient, LinkDTO } from '@/lib/api';
import { ExternalLink, ChevronLeft, ChevronRight, Trash2, User } from 'lucide-react';

export function AllLinksManager() {
  const [links, setLinks] = useState<LinkDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadLinks();
  }, [currentPage]);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      // Request one extra item to check if there are more pages
      const data = await apiClient.getAllLinks(skip, itemsPerPage + 1);
      
      if (data.length > itemsPerPage) {
        // There are more items, so remove the extra one and set hasMore to true
        setLinks(data.slice(0, itemsPerPage));
        setHasMore(true);
      } else {
        // No more items
        setLinks(data);
        setHasMore(false);
      }
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the link "${label}"? This action cannot be undone.`)) return;
    
    setIsLoading(true);
    try {
      await apiClient.deleteLink(id);
      setSuccess(`Link "${label}" deleted successfully`);
      
      // If this was the only item on the current page and we're not on page 1,
      // go back to the previous page
      if (links.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadLinks();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete link');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          View and manage all links in the system
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex justify-between items-center">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-red-700 hover:text-red-800"
          >
            ×
          </Button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex justify-between items-center">
          <span>{success}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-green-700 hover:text-green-800"
          >
            ×
          </Button>
        </div>
      )}

      {isLoading && links.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading links...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {links.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">No links found</div>
              <div className="text-sm">No links have been created yet.</div>
            </div>
          ) : (
            links.map((link) => (
              <Card key={link.id} className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{link.label}</h3>
                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                          <User className="h-3 w-3 mr-1" />
                          {link.author_id}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm break-all mb-2">{link.url}</p>
                      {link.description && (
                        <p className="text-gray-500 text-sm mb-3">{link.description}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-400">
                        <span>Created: {new Date(link.created_at).toLocaleDateString()}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Short URL: {window.location.origin}/{link.label}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                        className="flex-1 sm:flex-none"
                      >
                        <ExternalLink className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Open</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(link.id, link.label)}
                        className="flex-1 sm:flex-none"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {links.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2">
          <div className="text-sm text-gray-600">
            Page {currentPage} • Showing {links.length} link{links.length !== 1 ? 's' : ''}
            {hasMore && ' • More available'}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasMore || isLoading}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
