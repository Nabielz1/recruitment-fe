import api from '../../api/axiosInstance';

/**
 * Mengunggah file ke backend.
 * @param file Objek File yang akan diunggah.
 * @param type Jenis dokumen (e.g., 'photo', 'diploma').
 * @returns Promise dengan data response dari server.
 */
export const uploadFile = async (file: File, type: string) => {
  // Kita harus menggunakan FormData untuk mengirim file
  const formData = new FormData();
  formData.append('file', file); // 'file' harus sesuai dengan nama field di backend handler

  const response = await api.post(`/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};