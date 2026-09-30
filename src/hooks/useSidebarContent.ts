import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SidebarContent {
  aboutUs: string;
  contactPhone: string;
  contactEmail: string;
  contactMessage: string;
  deliveryInfo: string;
  pickupInfo: string;
}

export const useSidebarContent = () => {
  const [content, setContent] = useState<SidebarContent>({
    aboutUs: 'You can also Contact us on our page for faster transaction @Bro-Ger FB page',
    contactPhone: '+639171102916',
    contactEmail: 'brogerphilippines@gmail.com',
    contactMessage: '+63',
    deliveryInfo: 'Within bagong barrio',
    pickupInfo: 'Pickup time: WE WILL CONTACT YOU ONCE YOUR ORDER IS DONE'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSidebarContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('id', [
          'sidebar_about_us',
          'sidebar_contact_phone',
          'sidebar_contact_email',
          'sidebar_contact_message',
          'sidebar_delivery_info',
          'sidebar_pickup_info'
        ]);

      if (error) throw error;

      const settings: SidebarContent = {
        aboutUs: data.find(s => s.id === 'sidebar_about_us')?.value || 'You can also Contact us on our page for faster transaction @Bro-Ger FB page',
        contactPhone: data.find(s => s.id === 'sidebar_contact_phone')?.value || '+639171102916',
        contactEmail: data.find(s => s.id === 'sidebar_contact_email')?.value || 'brogerphilippines@gmail.com',
        contactMessage: data.find(s => s.id === 'sidebar_contact_message')?.value || '+63',
        deliveryInfo: data.find(s => s.id === 'sidebar_delivery_info')?.value || 'Within bagong barrio',
        pickupInfo: data.find(s => s.id === 'sidebar_pickup_info')?.value || 'Pickup time: WE WILL CONTACT YOU ONCE YOUR ORDER IS DONE'
      };

      setContent(settings);
    } catch (err) {
      console.error('Error fetching sidebar content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sidebar content');
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarContent();
  }, []);

  return {
    content,
    loading,
    error,
    refetch: fetchSidebarContent
  };
};

