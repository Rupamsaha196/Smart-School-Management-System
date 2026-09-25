import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export function useClasses() {
  const [classOptions, setClassOptions] = useState([]);
  
  useEffect(() => {
    api.get('/students')
      .then(({ data }) => {
        const uniqueClasses = [...new Set(data.map(s => `${s.class_name || 'Class 10'} - ${s.section || 'A'}`))].sort();
        setClassOptions(uniqueClasses);
      })
      .catch(() => {
        console.warn("Could not fetch classes");
        setClassOptions(['Class 10 - A', 'Class 10 - B', 'Class 12 - Science']);
      });
  }, []);
  
  return classOptions;
}
