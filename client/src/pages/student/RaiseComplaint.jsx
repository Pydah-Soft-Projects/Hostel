import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PhotoIcon, XCircleIcon } from '@heroicons/react/24/outline';

const FALLBACK_CATEGORIES = [
  { id: 4, name: 'Hostel', sub_categories: [{ id: 5, name: 'Power' }, { id: 6, name: 'Wifi' }] },
  { id: 9, name: 'Plumbing', sub_categories: [] },
  { id: 10, name: 'Electrical', sub_categories: [] },
  { id: 11, name: 'Carpentry', sub_categories: [] },
  { id: 12, name: 'House Keeping & Hygiene', sub_categories: [] },
  { id: 7, name: 'Civil Related', sub_categories: [{ id: 8, name: 'Repair Works' }] }
];

const RaiseComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [form, setForm] = useState({
    categoryId: '',
    categoryName: '',
    subCategoryId: '',
    subCategoryName: '',
    title: '',
    description: ''
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [aiProcessing, setAiProcessing] = useState(false);

  // Fetch live categories from maintenance database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.get('/api/complaints/categories');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setCategories(res.data.data);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (err) {
        console.error('Failed to load maintenance categories, using fallback:', err);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const selectedCategory = categories.find(c => String(c.id) === String(form.categoryId));
  const availableSubCategories = selectedCategory?.sub_categories || [];

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const catObj = categories.find(c => String(c.id) === String(catId));
    setForm(prev => ({
      ...prev,
      categoryId: catId,
      categoryName: catObj ? catObj.name : '',
      subCategoryId: '',
      subCategoryName: ''
    }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const handleSubCategoryChange = (e) => {
    const subId = e.target.value;
    const subObj = availableSubCategories.find(s => String(s.id) === String(subId));
    setForm(prev => ({
      ...prev,
      subCategoryId: subId,
      subCategoryName: subObj ? subObj.name : ''
    }));
    if (errors.subCategory) {
      setErrors(prev => ({ ...prev, subCategory: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.categoryId) {
      newErrors.category = 'Please select an issue category';
    }
    
    if (availableSubCategories.length > 0 && !form.subCategoryId) {
      newErrors.subCategory = 'Please select a sub-category';
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'Please provide a description';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (form.description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a complaint');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const generatedTitle = form.title.trim() 
        ? form.title.trim() 
        : (form.subCategoryName ? `${form.categoryName} - ${form.subCategoryName}` : form.categoryName);

      const formData = new FormData();
      formData.append('categoryId', form.categoryId);
      formData.append('category', form.categoryName);
      if (form.subCategoryId) {
        formData.append('subCategoryId', form.subCategoryId);
        formData.append('subCategory', form.subCategoryName);
      }
      formData.append('title', generatedTitle);
      formData.append('description', form.description.trim());
      if (image) {
        formData.append('image', image);
      }

      const response = await api.post('/api/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        if (response.data.data.aiProcessing) {
          setAiProcessing(true);
          toast.success('Complaint submitted to Maintenance! Processing assignment...');
          pollAIProcessing(response.data.data._id);
        } else {
          toast.success('Complaint submitted successfully to Maintenance!');
          setForm({
            categoryId: '',
            categoryName: '',
            subCategoryId: '',
            subCategoryName: '',
            title: '',
            description: ''
          });
          setImage(null);
          setImagePreview(null);
          
          window.dispatchEvent(new Event('complaint-submitted'));
          
          setTimeout(() => {
            navigate('/student/my-complaints');
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to submit complaint. Please try again.';
        toast.error(errorMessage);
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const pollAIProcessing = async (complaintId) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/api/complaints/${complaintId}`);
        if (response.data.data.aiProcessed) {
          clearInterval(interval);
          setAiProcessing(false);
          toast.success('Complaint assigned! Check your complaints for updates.');
          navigate('/student/my-complaints');
        }
      } catch (error) {
        clearInterval(interval);
        setAiProcessing(false);
        toast.error('AI processing completed. Maintenance team will handle.');
        navigate('/student/my-complaints');
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto mt-12 sm:mt-16 lg:mt-0">
        {/* Header */}
        <div className="max-w-2xl mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg shadow-blue-100 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent truncate">
                Raise a Complaint
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-1">
                Submit maintenance requests directly to the campus maintenance department
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-3 sm:p-4 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Category Selection from Maintenance DB */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 border rounded-lg bg-gray-50 text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span>Loading maintenance categories...</span>
                  </div>
                ) : (
                  <select
                    name="category"
                    value={form.categoryId}
                    onChange={handleCategoryChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.category && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Dynamic Sub-category Selection (only if category has subcategories) */}
              {availableSubCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Sub-Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subCategory"
                    value={form.subCategoryId}
                    onChange={handleSubCategoryChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                      errors.subCategory ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select sub-category</option>
                    {availableSubCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  {errors.subCategory && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.subCategory}</p>
                  )}
                </motion.div>
              )}

              {/* Optional Issue Title */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Issue Summary / Title <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Fan making noise, Tap leaking in washroom"
                  maxLength={100}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Description <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-1.5 sm:ml-2">
                    ({form.description.length}/1000)
                  </span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows="4"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm resize-none leading-relaxed ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Please describe your issue in detail (minimum 10 characters)..."
                  required
                  maxLength={1000}
                />
                {errors.description && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 break-words">{errors.description}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Photo Attachment <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="mt-1 flex justify-center px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-5 pb-3 sm:pb-4 lg:pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-2 text-center w-full">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="mx-auto h-24 sm:h-28 lg:h-36 w-auto object-cover rounded-lg max-w-full shadow" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 hover:bg-red-600 active:bg-red-700 touch-manipulation transition-colors shadow-sm"
                          title="Remove image"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <PhotoIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                        <div className="flex flex-col sm:flex-row text-xs sm:text-sm text-gray-600 justify-center items-center gap-1 sm:gap-0">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 active:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 touch-manipulation px-2 py-1"
                          >
                            <span>Upload a photo</span>
                            <input
                              id="image-upload"
                              name="image"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="text-xs text-gray-500 sm:ml-1">or take a picture</p>
                        </div>
                        <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2 sm:pt-3">
                <button
                  type="submit"
                  disabled={loading || loadingCategories}
                  className={`px-4 sm:px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 w-full sm:w-auto touch-manipulation text-sm sm:text-base ${
                    loading || loadingCategories
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg active:scale-95'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting to Maintenance...</span>
                    </span>
                  ) : (
                    <span>Submit Complaint</span>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Footer Note */}
          <div className="bg-gray-50 px-4 sm:px-8 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="leading-relaxed">
                Tickets are submitted directly to the campus Maintenance Management System.
              </span>
            </div>
          </div>
        </motion.div>

        {/* AI Processing Overlay */}
        {aiProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 sm:p-8 text-center max-w-sm sm:max-w-md mx-auto w-full shadow-2xl">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Assigning to Maintenance Staff</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Please wait, your ticket is being registered and assigned to the relevant department...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaiseComplaint;
