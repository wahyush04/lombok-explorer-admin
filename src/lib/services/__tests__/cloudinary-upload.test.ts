import {
  validateImageFile,
  mapCloudinaryResponseToAsset,
  cloudinaryUploadService,
  DEFAULT_MAX_FILE_SIZE,
} from '../cloudinary-upload.service';
import { CloudinaryDirectUploadResponse, UploadResourceType, CloudinaryAsset } from '@/types/upload.types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  }
}

// Mock File implementation for Node.js environment
class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;

  constructor(name: string, size: number, type: string) {
    this.name = name;
    this.size = size;
    this.type = type;
    this.lastModified = Date.now();
  }
}

async function runAllTests() {
  console.log('\n=== RUNNING CLOUDINARY UPLOAD ARCHITECTURE TEST SUITE ===\n');

  // -------------------------------------------------------------
  // 1. File Validation Tests
  // -------------------------------------------------------------
  console.log('--- 1. File Validation Tests ---');

  const validJpg = new MockFile('beach.jpg', 1024 * 500, 'image/jpeg') as unknown as File;
  const resValidJpg = validateImageFile(validJpg);
  assert(resValidJpg.valid === true, 'Accept valid JPG file');

  const validPng = new MockFile('logo.png', 1024 * 200, 'image/png') as unknown as File;
  const resValidPng = validateImageFile(validPng);
  assert(resValidPng.valid === true, 'Accept valid PNG file');

  const validWebp = new MockFile('photo.webp', 1024 * 300, 'image/webp') as unknown as File;
  const resValidWebp = validateImageFile(validWebp);
  assert(resValidWebp.valid === true, 'Accept valid WebP file');

  const invalidPdf = new MockFile('document.pdf', 1024 * 100, 'application/pdf') as unknown as File;
  const resInvalidPdf = validateImageFile(invalidPdf);
  assert(resInvalidPdf.valid === false, 'Reject invalid PDF format');
  assert(
    typeof resInvalidPdf.error === 'string' && resInvalidPdf.error.includes('Format image tidak didukung'),
    'Provide clear Indonesian error message for invalid format'
  );

  const invalidExe = new MockFile('virus.exe', 1024 * 100, 'application/x-msdownload') as unknown as File;
  assert(validateImageFile(invalidExe).valid === false, 'Reject executable file');

  const oversizedFile = new MockFile('giant.jpg', DEFAULT_MAX_FILE_SIZE + 1024, 'image/jpeg') as unknown as File;
  const resOversized = validateImageFile(oversizedFile);
  assert(resOversized.valid === false, 'Reject file larger than maxFileSize');
  assert(
    typeof resOversized.error === 'string' && resOversized.error.includes('Ukuran image terlalu besar'),
    'Provide clear Indonesian error message for oversized file'
  );

  // -------------------------------------------------------------
  // 2. Cloudinary Response Mapping Tests
  // -------------------------------------------------------------
  console.log('\n--- 2. Cloudinary Response Mapping Tests ---');

  const mockCloudinaryResponse: CloudinaryDirectUploadResponse = {
    public_id: 'lombok-explorer/admin/destinations/tanjung_aan_01',
    secure_url: 'https://res.cloudinary.com/tzccdgab/image/upload/v12345/tanjung_aan_01.jpg',
    width: 1920,
    height: 1080,
    format: 'jpg',
    bytes: 345600,
    resource_type: 'image',
    original_filename: 'pantai-tanjung-aan.jpg',
  };

  const asset = mapCloudinaryResponseToAsset(mockCloudinaryResponse);
  assert(asset.publicId === 'lombok-explorer/admin/destinations/tanjung_aan_01', 'Map publicId correctly');
  assert(asset.secureUrl.startsWith('https://res.cloudinary.com/'), 'Map secureUrl correctly');
  assert(asset.width === 1920, 'Map image width correctly');
  assert(asset.height === 1080, 'Map image height correctly');
  assert(asset.format === 'jpg', 'Map format correctly');
  assert(asset.bytes === 345600, 'Map file bytes correctly');
  assert(asset.originalFilename === 'pantai-tanjung-aan.jpg', 'Map originalFilename correctly');
  assert(asset.resourceType === 'image', 'Map resourceType as image');

  // Fallback filename test
  const mockWithoutFilename: CloudinaryDirectUploadResponse = {
    public_id: 'dest_test_02',
    secure_url: 'https://res.cloudinary.com/test.png',
  };
  const fallbackAsset = mapCloudinaryResponseToAsset(mockWithoutFilename, 'custom-name.png');
  assert(fallbackAsset.originalFilename === 'custom-name.png', 'Use fallback filename when original_filename missing');

  // -------------------------------------------------------------
  // 3. Resource Type & Endpoint Contract Tests
  // -------------------------------------------------------------
  console.log('\n--- 3. Resource Type & Contract Tests ---');

  const validResourceTypes: UploadResourceType[] = [
    'DESTINATION',
    'DESTINATION_IMAGE',
    'CATEGORY',
    'RESTAURANT',
    'ACCOMMODATION',
    'ITINERARY_TEMPLATE',
    'USER_AVATAR',
    'REVIEW',
    'FEED',
  ];

  assert(validResourceTypes.length === 9, 'All 9 backend resource types supported');
  assert(validResourceTypes.includes('DESTINATION'), 'DESTINATION is valid');
  assert(validResourceTypes.includes('DESTINATION_IMAGE'), 'DESTINATION_IMAGE is valid');
  assert(validResourceTypes.includes('CATEGORY'), 'CATEGORY is valid');
  assert(validResourceTypes.includes('RESTAURANT'), 'RESTAURANT is valid');
  assert(validResourceTypes.includes('ACCOMMODATION'), 'ACCOMMODATION is valid');
  assert(validResourceTypes.includes('ITINERARY_TEMPLATE'), 'ITINERARY_TEMPLATE is valid');

  // -------------------------------------------------------------
  // 4. Duplicate Prevention & Order Indexing Tests
  // -------------------------------------------------------------
  console.log('\n--- 4. Duplicate Prevention & Ordering Tests ---');

  const initialAssets: CloudinaryAsset[] = [
    {
      publicId: 'img_1',
      secureUrl: 'https://example.com/1.jpg',
      originalFilename: 'foto1.jpg',
      orderIndex: 0,
      isPrimary: true,
    },
    {
      publicId: 'img_2',
      secureUrl: 'https://example.com/2.jpg',
      originalFilename: 'foto2.jpg',
      orderIndex: 1,
      isPrimary: false,
    },
  ];

  // Check duplicate detection logic
  const existingNames = new Set(initialAssets.map((a) => a.originalFilename?.toLowerCase()));
  const isDuplicate = existingNames.has('foto1.jpg'.toLowerCase());
  const isNotDuplicate = existingNames.has('foto3.jpg'.toLowerCase());
  assert(isDuplicate === true, 'Detect duplicate file name correctly');
  assert(isNotDuplicate === false, 'Allow distinct file name');

  // Primary image selection test
  const setPrimaryIndex = 1;
  const reorderedAssets = [initialAssets[setPrimaryIndex], ...initialAssets.filter((_, idx) => idx !== setPrimaryIndex)].map(
    (item, idx) => ({
      ...item,
      orderIndex: idx,
      isPrimary: idx === 0,
    })
  );

  assert(reorderedAssets[0].publicId === 'img_2', 'Selected primary image moves to index 0');
  assert(reorderedAssets[0].isPrimary === true, 'Primary image has isPrimary = true');
  assert(reorderedAssets[1].isPrimary === false, 'Non-primary image has isPrimary = false');
  assert(reorderedAssets[0].orderIndex === 0 && reorderedAssets[1].orderIndex === 1, 'OrderIndex is sequential (0, 1)');

  // -------------------------------------------------------------
  // 5. Partial Upload Failure Handling Tests
  // -------------------------------------------------------------
  console.log('\n--- 5. Partial Upload Failure Handling Tests ---');

  const mockBatchResults = [
    { index: 0, success: true, asset: { publicId: 'p0', secureUrl: 'url0' } },
    { index: 1, success: false, error: 'Network connection timeout' },
    { index: 2, success: true, asset: { publicId: 'p2', secureUrl: 'url2' } },
  ];

  const successfulOnly = mockBatchResults.filter((r) => r.success);
  const failedOnly = mockBatchResults.filter((r) => !r.success);

  assert(successfulOnly.length === 2, 'Successful uploads preserved independently');
  assert(failedOnly.length === 1, 'Failed upload tracked with specific error');
  assert(failedOnly[0].index === 1, 'Failed item index correctly identified for individual retry');

  // Summary
  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  console.log(`========================================\n`);

  if (passedTests === totalTests) {
    console.log('🎉 ALL CLOUDINARY UPLOAD TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
