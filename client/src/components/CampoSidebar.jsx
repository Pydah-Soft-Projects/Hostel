import Sidebar, { DEFAULT_LIBRARY_SECTIONS } from './Sidebar';

/**
 * Standardized Enterprise Campo Portal Sidebar
 * Re-exports the exact Library Management Sidebar component
 * Ensures full backward compatibility while sharing identical source of truth.
 */
export const CampoSidebar = Sidebar;
export { DEFAULT_LIBRARY_SECTIONS };
export default Sidebar;
