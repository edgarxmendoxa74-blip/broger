import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ServiceOption } from '../types';

export const useServiceOptions = () => {
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('service_options')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setServiceOptions(data || []);
    } catch (err) {
      console.error('Error fetching service options:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch service options');
      setServiceOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllServiceOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('service_options')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setServiceOptions(data || []);
    } catch (err) {
      console.error('Error fetching all service options:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch service options');
      setServiceOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const addServiceOption = async (serviceOption: Omit<ServiceOption, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('service_options')
        .insert([serviceOption])
        .select()
        .single();

      if (error) throw error;

      setServiceOptions(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding service option:', err);
      throw err;
    }
  };

  const updateServiceOption = async (id: string, updates: Partial<ServiceOption>) => {
    try {
      const { data, error } = await supabase
        .from('service_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setServiceOptions(prev =>
        prev.map(item => (item.id === id ? data : item))
      );
      return data;
    } catch (err) {
      console.error('Error updating service option:', err);
      throw err;
    }
  };

  const deleteServiceOption = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_options')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServiceOptions(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting service option:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchServiceOptions();
  }, []);

  return {
    serviceOptions,
    loading,
    error,
    refetch: fetchServiceOptions,
    fetchAll: fetchAllServiceOptions,
    addServiceOption,
    updateServiceOption,
    deleteServiceOption
  };
};










