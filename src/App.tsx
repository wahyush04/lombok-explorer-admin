import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoginForm } from '@/features/auth/components/LoginForm';

// Feature Views
import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';

// Destinations
import { DestinationTable } from '@/features/destinations/components/DestinationTable';
import { DestinationFormModal } from '@/features/destinations/components/DestinationFormModal';
import { DestinationDetailModal } from '@/features/destinations/components/DestinationDetailModal';
import { DestinationGalleryModal } from '@/features/destinations/components/DestinationGalleryModal';
import { Destination, DestinationDetail } from '@/types/destination.types';

// Categories
import { CategoryTable } from '@/features/categories/components/CategoryTable';
import { CategoryFormModal } from '@/features/categories/components/CategoryFormModal';
import { Category } from '@/types/category.types';

// Restaurants
import { RestaurantTable } from '@/features/restaurants/components/RestaurantTable';
import { RestaurantFormModal } from '@/features/restaurants/components/RestaurantFormModal';
import { RestaurantDetailModal } from '@/features/restaurants/components/RestaurantDetailModal';
import { Restaurant } from '@/types/restaurant.types';

// Accommodations
import { AccommodationTable } from '@/features/accommodations/components/AccommodationTable';
import { AccommodationFormModal } from '@/features/accommodations/components/AccommodationFormModal';
import { AccommodationDetailModal } from '@/features/accommodations/components/AccommodationDetailModal';
import { Accommodation } from '@/types/accommodation.types';

// Users
import { UserTable } from '@/features/users/components/UserTable';

// Reviews
import { ReviewTable } from '@/features/reviews/components/ReviewTable';

// Feeds
import { FeedTable } from '@/features/feeds/components/FeedTable';

// Itineraries
import { ItineraryTable } from '@/features/itineraries/components/ItineraryTable';
import { ItineraryFormModal } from '@/features/itineraries/components/ItineraryFormModal';
import { ItineraryDetailModal } from '@/features/itineraries/components/ItineraryDetailModal';
import { ItineraryTemplate } from '@/types/itinerary.types';

// Audit Logs
import { AuditLogTable } from '@/features/audit-logs/components/AuditLogTable';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

export function AppContent() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Route State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    const validPaths = [
      '/dashboard',
      '/destinations',
      '/categories',
      '/restaurants',
      '/accommodations',
      '/users',
      '/reviews',
      '/feeds',
      '/itinerary-templates',
      '/audit-logs',
    ];
    return validPaths.includes(p) ? p : '/dashboard';
  });

  // Verify auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname;
      if (p && p !== '/') {
        setCurrentPath(p);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  // Destinations Modals State
  const [dstFormOpen, setDstFormOpen] = useState(false);
  const [dstToEdit, setDstToEdit] = useState<DestinationDetail | null>(null);
  const [dstDetailOpen, setDstDetailOpen] = useState(false);
  const [dstSelected, setDstSelected] = useState<Destination | null>(null);
  const [dstGalleryOpen, setDstGalleryOpen] = useState(false);

  // Categories Modals State
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [catToEdit, setCatToEdit] = useState<Category | null>(null);

  // Restaurants Modals State
  const [restFormOpen, setRestFormOpen] = useState(false);
  const [restToEdit, setRestToEdit] = useState<Restaurant | null>(null);
  const [restDetailOpen, setRestDetailOpen] = useState(false);
  const [restSelected, setRestSelected] = useState<Restaurant | null>(null);

  // Accommodations Modals State
  const [accFormOpen, setAccFormOpen] = useState(false);
  const [accToEdit, setAccToEdit] = useState<Accommodation | null>(null);
  const [accDetailOpen, setAccDetailOpen] = useState(false);
  const [accSelected, setAccSelected] = useState<Accommodation | null>(null);

  // Itineraries Modals State
  const [itnFormOpen, setItnFormOpen] = useState(false);
  const [itnToEdit, setItnToEdit] = useState<ItineraryTemplate | null>(null);
  const [itnDetailOpen, setItnDetailOpen] = useState(false);
  const [itnSelected, setItnSelected] = useState<ItineraryTemplate | null>(null);

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setCurrentPath('/dashboard')} />;
  }

  const renderCurrentModule = () => {
    switch (currentPath) {
      case '/dashboard':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Dashboard Analitik"
              description="Ringkasan performa konten, aktivitas wisatawan, dan statistik pariwisata Lombok."
            />
            <DashboardOverview onNavigate={handleNavigate} />
          </div>
        );

      case '/destinations':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Destinasi Pariwisata"
              description="Katalog daya tarik wisata alam, pantai, pegunungan, dan budaya di seluruh pulau Lombok."
            />
            <DestinationTable
              onAdd={() => {
                setDstToEdit(null);
                setDstFormOpen(true);
              }}
              onView={(dst) => {
                setDstSelected(dst);
                setDstDetailOpen(true);
              }}
              onEdit={(dst) => {
                setDstToEdit(dst as DestinationDetail);
                setDstFormOpen(true);
              }}
              onManageGallery={(dst) => {
                setDstSelected(dst);
                setDstGalleryOpen(true);
              }}
            />
          </div>
        );

      case '/categories':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Kategori Wisata"
              description="Struktur pengelompokan jenis atraksi dan daya tarik pariwisata Lombok."
            />
            <CategoryTable
              onAdd={() => {
                setCatToEdit(null);
                setCatFormOpen(true);
              }}
              onEdit={(cat) => {
                setCatToEdit(cat);
                setCatFormOpen(true);
              }}
            />
          </div>
        );

      case '/restaurants':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Kuliner & Restoran"
              description="Daftar rumah makan, warung tradisional Sasak, sajian kuliner halal, dan kafe Lombok."
            />
            <RestaurantTable
              onAdd={() => {
                setRestToEdit(null);
                setRestFormOpen(true);
              }}
              onView={(rest) => {
                setRestSelected(rest);
                setRestDetailOpen(true);
              }}
              onEdit={(rest) => {
                setRestToEdit(rest);
                setRestFormOpen(true);
              }}
            />
          </div>
        );

      case '/accommodations':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Akomodasi & Hotel"
              description="Pengelolaan hotel, resort tepi pantai, villa pribadi, dan homestay di seluruh wilayah Lombok."
            />
            <AccommodationTable
              onAdd={() => {
                setAccToEdit(null);
                setAccFormOpen(true);
              }}
              onView={(acc) => {
                setAccSelected(acc);
                setAccDetailOpen(true);
              }}
              onEdit={(acc) => {
                setAccToEdit(acc);
                setAccFormOpen(true);
              }}
            />
          </div>
        );

      case '/users':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Manajemen Pengguna"
              description="Kelola akun pengguna terdaftar, status suspensi, dan tingkat kewenangan peran sistem."
            />
            <UserTable />
          </div>
        );

      case '/reviews':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Moderasi Ulasan Wisatawan"
              description="Tinjau, setujui, atau tolak ulasan dan penilaian bintang dari wisatawan komunitas."
            />
            <ReviewTable />
          </div>
        );

      case '/feeds':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Feed Komunitas & Laporan"
              description="Moderasi linimasa sosial komunitas, foto wisatawan, dan tanggapan laporan pelanggaran."
            />
            <FeedTable />
          </div>
        );

      case '/itinerary-templates':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Template Rencana Perjalanan"
              description="Panduan paket rencana perjalanan terstruktur harian bagi para wisatawan."
            />
            <ItineraryTable
              onAdd={() => {
                setItnToEdit(null);
                setItnFormOpen(true);
              }}
              onView={(itn) => {
                setItnSelected(itn);
                setItnDetailOpen(true);
              }}
              onEdit={(itn) => {
                setItnToEdit(itn);
                setItnFormOpen(true);
              }}
            />
          </div>
        );

      case '/audit-logs':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Rekam Jejak Audit Sistem"
              description="Catatan aktivitas administratif, perubahan status konten, dan histori sistem secara transparan."
            />
            <AuditLogTable />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <PageHeader
              title="Dashboard Analitik"
              description="Ringkasan performa konten, aktivitas wisatawan, dan statistik pariwisata Lombok."
            />
            <DashboardOverview onNavigate={handleNavigate} />
          </div>
        );
    }
  };

  return (
    <AdminLayout currentPath={currentPath} onNavigate={handleNavigate}>
      {renderCurrentModule()}

      {/* Destination Modals */}
      <DestinationFormModal
        open={dstFormOpen}
        onOpenChange={setDstFormOpen}
        destinationToEdit={dstToEdit}
        onSuccess={() => {}}
      />
      <DestinationDetailModal
        open={dstDetailOpen}
        onOpenChange={setDstDetailOpen}
        destination={dstSelected}
        onEdit={(dst) => {
          setDstToEdit(dst as DestinationDetail);
          setDstFormOpen(true);
        }}
        onManageGallery={(dst) => {
          setDstSelected(dst);
          setDstGalleryOpen(true);
        }}
      />
      <DestinationGalleryModal
        open={dstGalleryOpen}
        onOpenChange={setDstGalleryOpen}
        destination={dstSelected}
      />

      {/* Category Modal */}
      <CategoryFormModal
        open={catFormOpen}
        onOpenChange={setCatFormOpen}
        categoryToEdit={catToEdit}
        onSuccess={() => {}}
      />

      {/* Restaurant Modals */}
      <RestaurantFormModal
        open={restFormOpen}
        onOpenChange={setRestFormOpen}
        restaurantToEdit={restToEdit}
        onSuccess={() => {}}
      />
      <RestaurantDetailModal
        open={restDetailOpen}
        onOpenChange={setRestDetailOpen}
        restaurant={restSelected}
        onEdit={(rest) => {
          setRestToEdit(rest);
          setRestFormOpen(true);
        }}
      />

      {/* Accommodation Modals */}
      <AccommodationFormModal
        open={accFormOpen}
        onOpenChange={setAccFormOpen}
        accommodationToEdit={accToEdit}
        onSuccess={() => {}}
      />
      <AccommodationDetailModal
        open={accDetailOpen}
        onOpenChange={setAccDetailOpen}
        accommodation={accSelected}
        onEdit={(acc) => {
          setAccToEdit(acc);
          setAccFormOpen(true);
        }}
      />

      {/* Itinerary Modals */}
      <ItineraryFormModal
        open={itnFormOpen}
        onOpenChange={setItnFormOpen}
        itineraryToEdit={itnToEdit}
        onSuccess={() => {}}
      />
      <ItineraryDetailModal
        open={itnDetailOpen}
        onOpenChange={setItnDetailOpen}
        itinerary={itnSelected}
        onEdit={(itn) => {
          setItnToEdit(itn);
          setItnFormOpen(true);
        }}
      />
    </AdminLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
