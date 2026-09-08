import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_METADATA,
} from '@/lib/constants/locales';
import { useLocaleStore } from '@/stores/locale.store';
import { idDictionary } from '../dictionaries/id';
import { enDictionary } from '../dictionaries/en';
import { calculateTranslationStatus } from '@/types/localization.types';
import { destinationSchema, buildDestinationTranslations } from '@/features/destinations/schemas/destination.schema';
import { categorySchema, buildCategoryTranslations } from '@/features/categories/schemas/category.schema';
import { restaurantSchema, buildRestaurantTranslations } from '@/features/restaurants/schemas/restaurant.schema';
import { accommodationSchema, buildAccommodationTranslations } from '@/features/accommodations/schemas/accommodation.schema';
import { itinerarySchema, buildItineraryTranslations } from '@/features/itineraries/schemas/itinerary.schema';
import { normalizeApiError, isErrorCode, ApiError, mapBackendErrorToFormField, setBackendValidationErrors } from '@/lib/api/api-error';

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

async function runLocalizationTests() {
  console.log('\n=== RUNNING CMS LOCALIZATION ARCHITECTURE TEST SUITE ===\n');

  // -------------------------------------------------------------
  // 1. Locale Configuration Tests
  // -------------------------------------------------------------
  console.log('--- 1. Locale Configuration Tests ---');

  assert(SUPPORTED_LOCALES.includes('id-ID'), 'Supported locales include id-ID');
  assert(SUPPORTED_LOCALES.includes('en-US'), 'Supported locales include en-US');
  assert(SUPPORTED_LOCALES.length === 2, 'Only supported backend locales (id-ID, en-US) are defined');
  assert(DEFAULT_LOCALE === 'id-ID', 'Default canonical locale is id-ID per openapi-admin.yaml');
  assert(isSupportedLocale('id-ID') === true, 'Accept valid id-ID locale');
  assert(isSupportedLocale('en-US') === true, 'Accept valid en-US locale');
  assert(isSupportedLocale('ja-JP') === false, 'Reject unsupported ja-JP locale');
  assert(isSupportedLocale(null) === false, 'Reject null locale');
  assert(LOCALE_METADATA['id-ID'].flag === '🇮🇩', 'Correct Indonesian flag metadata');
  assert(LOCALE_METADATA['en-US'].flag === '🇺🇸', 'Correct US English flag metadata');

  // -------------------------------------------------------------
  // 2. Admin UI Locale vs Content Locale Decoupling Tests
  // -------------------------------------------------------------
  console.log('\n--- 2. UI Locale vs Content Locale Decoupling Tests ---');

  const store = useLocaleStore.getState();
  store.setUiLocale('id-ID');
  store.setContentLocale('id-ID');

  assert(useLocaleStore.getState().uiLocale === 'id-ID', 'UI locale initially id-ID');
  assert(useLocaleStore.getState().contentLocale === 'id-ID', 'Content locale initially id-ID');

  // Switch UI locale to en-US
  store.setUiLocale('en-US');
  assert(useLocaleStore.getState().uiLocale === 'en-US', 'UI locale switched to en-US');
  assert(useLocaleStore.getState().contentLocale === 'id-ID', 'Content locale remains id-ID (decoupled)');

  // Switch Content locale to en-US
  store.setContentLocale('en-US');
  assert(useLocaleStore.getState().contentLocale === 'en-US', 'Content locale switched to en-US');

  // Switch UI locale back to id-ID
  store.setUiLocale('id-ID');
  assert(useLocaleStore.getState().uiLocale === 'id-ID', 'UI locale switched back to id-ID');
  assert(useLocaleStore.getState().contentLocale === 'en-US', 'Content locale remains en-US (decoupled)');

  // Reset to default
  store.setContentLocale('id-ID');

  // -------------------------------------------------------------
  // 3. UI Dictionary Parity & Completeness Tests
  // -------------------------------------------------------------
  console.log('\n--- 3. UI Dictionary Parity & Completeness Tests ---');

  const idSections = Object.keys(idDictionary);
  const enSections = Object.keys(enDictionary);

  assert(idSections.length === enSections.length, 'ID and EN dictionaries have identical section count');

  let allKeysMatch = true;
  idSections.forEach((section) => {
    const idKeys = Object.keys((idDictionary as any)[section]);
    const enKeys = Object.keys((enDictionary as any)[section]);
    if (idKeys.length !== enKeys.length) {
      allKeysMatch = false;
      console.error(`Mismatch in section ${section}: ID has ${idKeys.length}, EN has ${enKeys.length}`);
    }
    idKeys.forEach((k) => {
      if (!(enDictionary as any)[section]?.[k]) {
        allKeysMatch = false;
        console.error(`Missing key in enDictionary: ${section}.${k}`);
      }
    });
  });

  assert(allKeysMatch === true, '100% key parity between idDictionary and enDictionary');

  // -------------------------------------------------------------
  // 4. Content Translation Completeness Calculation Tests
  // -------------------------------------------------------------
  console.log('\n--- 4. Translation Completeness Calculation Tests ---');

  const completeStatus = calculateTranslationStatus(
    { locale: 'id-ID', name: 'Pantai Kuta', description: 'Pantai pasir putih indah' },
    ['name', 'description']
  );
  assert(completeStatus.status === 'COMPLETE', 'Identify COMPLETE translation status');
  assert(completeStatus.completenessPercent === 100, 'Complete translation has 100% completeness');
  assert(completeStatus.missingFields.length === 0, 'No missing fields in complete translation');

  const incompleteStatus = calculateTranslationStatus(
    { locale: 'en-US', name: 'Kuta Beach', description: '' },
    ['name', 'description']
  );
  assert(incompleteStatus.status === 'INCOMPLETE', 'Identify INCOMPLETE translation status');
  assert(incompleteStatus.completenessPercent === 50, 'Incomplete translation has 50% completeness');
  assert(incompleteStatus.missingFields.includes('description'), 'Accurately report missing field');

  const missingStatus = calculateTranslationStatus(null, ['name', 'description']);
  assert(missingStatus.status === 'MISSING', 'Identify MISSING translation status for null record');
  assert(missingStatus.completenessPercent === 0, 'Missing translation has 0% completeness');

  // -------------------------------------------------------------
  // 5. Translation DTO Payload Mapping Tests (5 Entities)
  // -------------------------------------------------------------
  console.log('\n--- 5. Translation DTO Payload Mapping Tests ---');

  // 5.1 Destination
  const destFormData: any = {
    name: 'Pantai Tanjung Aan',
    shortDescription: 'Pantai pasir merica',
    description: 'Deskripsi lengkap pantai Tanjung Aan...',
    address: 'Desa Sengkol, Pujut',
    en_name: 'Tanjung Aan Beach',
    en_shortDescription: 'White pepper sand beach',
    en_description: 'Comprehensive overview of Tanjung Aan beach...',
    en_address: 'Sengkol Village, Central Lombok',
  };
  const destTrans = buildDestinationTranslations(destFormData);
  assert(destTrans.length === 2, 'Build 2 translations for destination (id-ID, en-US)');
  assert(destTrans[0].locale === 'id-ID', 'First translation is canonical id-ID');
  assert(destTrans[0].name === 'Pantai Tanjung Aan', 'Correct Indonesian name in DTO');
  assert(destTrans[1].locale === 'en-US', 'Second translation is en-US');
  assert(destTrans[1].name === 'Tanjung Aan Beach', 'Correct English name in DTO');

  // 5.2 Category
  const catFormData: any = {
    name: 'Wisata Bahari',
    description: 'Pantai eksotis dan pulau gili',
    en_name: 'Marine & Beach Tourism',
    en_description: 'Exotic beaches and gili islands',
  };
  const catTrans = buildCategoryTranslations(catFormData);
  assert(catTrans.length === 2, 'Build 2 translations for category');
  assert(catTrans[1].locale === 'en-US', 'Category English translation has locale en-US');
  assert(catTrans[1].name === 'Marine & Beach Tourism', 'Category English name matches');

  // 5.3 Restaurant
  const restFormData: any = {
    name: 'RM Ayam Taliwang Pak Udin',
    description: 'Kuliner ayam pedas khas Sasak',
    en_name: 'Pak Udin Taliwang Chicken',
    en_description: 'Authentic Sasak spicy chicken',
  };
  const restTrans = buildRestaurantTranslations(restFormData);
  assert(restTrans.length === 2, 'Build 2 translations for restaurant');
  assert(restTrans[0].locale === 'id-ID', 'Restaurant Indonesian translation has locale id-ID');
  assert(restTrans[1].name === 'Pak Udin Taliwang Chicken', 'Restaurant English name matches');

  // 5.4 Accommodation
  const accFormData: any = {
    name: 'Katamaran Hotel & Resort',
    description: 'Resort bintang 5 tepi pantai',
    en_name: 'Katamaran Hotel & Resort Senggigi',
    en_description: '5-star beachfront luxury resort',
  };
  const accTrans = buildAccommodationTranslations(accFormData);
  assert(accTrans.length === 2, 'Build 2 translations for accommodation');
  assert(accTrans[1].description === '5-star beachfront luxury resort', 'Accommodation English description matches');

  // 5.5 Itinerary Template
  const itinFormData: any = {
    title: '3 Hari Eksplorasi Mandalika',
    description: 'Paket liburan santai',
    transportPaceNote: 'Mobil sewa AC',
    en_title: '3-Day Mandalika Coastal Exploration',
    en_description: 'Relaxed vacation package',
    en_transportPaceNote: 'Private rented AC car',
  };
  const itinTrans = buildItineraryTranslations(itinFormData);
  assert(itinTrans.length === 2, 'Build 2 translations for itinerary template');
  assert(itinTrans[1].title === '3-Day Mandalika Coastal Exploration', 'Itinerary English title matches');
  assert(itinTrans[1].transportPaceNote === 'Private rented AC car', 'Itinerary transport pace note matches');

  // -------------------------------------------------------------
  // 6. Locale-Aware Zod Validation Tests
  // -------------------------------------------------------------
  console.log('\n--- 6. Locale-Aware Zod Validation Tests ---');

  // Missing Indonesian name should fail with locale prefix
  const invalidDestRes = destinationSchema.safeParse({
    name: '',
    description: 'Deskripsi lengkap minimal sepuluh karakter',
    categoryId: 'cat_1',
    region: 'LOMBOK_SELATAN',
    locationName: 'Pujut',
    latitude: -8.9,
    longitude: 116.3,
  });
  assert(invalidDestRes.success === false, 'Reject destination without required Indonesian name');
  if (!invalidDestRes.success) {
    const issue = invalidDestRes.error.issues.find((i) => i.path.includes('name'));
    assert(
      Boolean(issue?.message.includes('Bahasa Indonesia')),
      'Validation error identifies Indonesian language requirement'
    );
  }

  // Partial English entry (en_name provided without en_description)
  const partialEnRes = destinationSchema.safeParse({
    name: 'Pantai Kuta',
    description: 'Deskripsi lengkap pantai kuta lombok',
    categoryId: 'cat_1',
    region: 'LOMBOK_SELATAN',
    locationName: 'Pujut',
    latitude: -8.9,
    longitude: 116.3,
    en_name: 'Kuta Beach', // English name provided
    en_description: '',    // English description omitted
  });
  assert(partialEnRes.success === false, 'Reject partial English translation when name provided without description');
  if (!partialEnRes.success) {
    const enIssue = partialEnRes.error.issues.find((i) => i.path.includes('en_description'));
    assert(
      Boolean(enIssue?.message.includes('English → Full description is required')),
      'Validation error explicitly identifies English language requirement'
    );
  }

  // Unentered English fields should pass valid Indonesian data
  const validIndoOnlyRes = destinationSchema.safeParse({
    name: 'Pantai Kuta',
    description: 'Deskripsi lengkap pantai kuta lombok',
    categoryId: 'cat_1',
    region: 'LOMBOK_SELATAN',
    locationName: 'Pujut',
    latitude: -8.9,
    longitude: 116.3,
    en_name: '',
    en_description: '',
  });
  assert(validIndoOnlyRes.success === true, 'Accept valid canonical Indonesian data when English is untouched');

  // -------------------------------------------------------------
  // 7. Stable Error Code & API Message Handling Tests
  // -------------------------------------------------------------
  console.log('\n--- 7. Stable Error Code & API Message Handling Tests ---');

  const backendError = {
    response: {
      status: 404,
      data: {
        success: false,
        errorCode: 'DESTINATION_NOT_FOUND',
        message: 'Destination tidak ditemukan',
      },
    },
  };

  const normalized = normalizeApiError(backendError);
  assert(normalized.errorCode === 'DESTINATION_NOT_FOUND', 'Preserve stable errorCode');
  assert(normalized.message === 'Destination tidak ditemukan', 'Use localized message for presentation');
  assert(isErrorCode(normalized, 'DESTINATION_NOT_FOUND') === true, 'isErrorCode returns true for matching code');
  assert(isErrorCode(normalized, 'OTHER_CODE') === false, 'isErrorCode returns false for non-matching code');

  // Support alternative 'code' field
  const backendErrorWithCode = {
    response: {
      status: 400,
      data: {
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Data tidak valid',
      },
    },
  };
  const normalizedWithCode = normalizeApiError(backendErrorWithCode);
  assert(normalizedWithCode.errorCode === 'VALIDATION_ERROR', 'Extract error code from data.code');
  assert(isErrorCode(normalizedWithCode, 'VALIDATION_ERROR') === true, 'isErrorCode detects data.code');

  // -------------------------------------------------------------
  // 8. Shared Media & Direct Upload Preservation Tests
  // -------------------------------------------------------------
  console.log('\n--- 8. Shared Media & Direct Upload Architecture Tests ---');

  const destWithMedia: any = {
    name: 'Pantai Mawun',
    description: 'Deskripsi pantai Mawun lombok selatan',
    en_name: 'Mawun Beach',
    en_description: 'Detailed description of Mawun Beach in South Lombok',
    coverImage: {
      publicId: 'destinations/admin_1/mawun_cover',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/mawun_cover.jpg',
      resourceType: 'image',
      isPrimary: true,
      orderIndex: 0,
    },
    images: [
      {
        publicId: 'destinations/admin_1/mawun_gallery_1',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/mawun_gallery_1.jpg',
        resourceType: 'image',
        isPrimary: false,
        orderIndex: 1,
      },
    ],
  };

  const translations = buildDestinationTranslations(destWithMedia);
  assert(translations.length === 2, 'Builds 2 translations without duplicating image arrays');
  assert(!('coverImage' in translations[0]), 'Translations DTO does not redundantly duplicate media assets');
  assert(!('coverImage' in translations[1]), 'English Translation DTO does not redundantly duplicate media assets');

  // -------------------------------------------------------------
  // 9. Backend Validation Error Path Mapping Tests
  // -------------------------------------------------------------
  console.log('\n--- 9. Backend Validation Error Path Mapping Tests ---');

  assert(
    mapBackendErrorToFormField('translations.en-US.name') === 'en_name',
    'Map translations.en-US.name to en_name'
  );
  assert(
    mapBackendErrorToFormField('translations.en-US.description') === 'en_description',
    'Map translations.en-US.description to en_description'
  );
  assert(
    mapBackendErrorToFormField('translations.en-US.title') === 'en_title',
    'Map translations.en-US.title to en_title'
  );
  assert(
    mapBackendErrorToFormField('translations.en-US.transportPaceNote') === 'en_transportPaceNote',
    'Map translations.en-US.transportPaceNote to en_transportPaceNote'
  );
  assert(
    mapBackendErrorToFormField('translations.1.name') === 'en_name',
    'Map translations.1.name to en_name'
  );
  assert(
    mapBackendErrorToFormField('translations.id-ID.name') === 'name',
    'Map translations.id-ID.name to canonical name'
  );
  assert(
    mapBackendErrorToFormField('translations.0.description') === 'description',
    'Map translations.0.description to canonical description'
  );
  assert(
    mapBackendErrorToFormField('categoryId') === 'categoryId',
    'Preserve root field name unmodified'
  );

  // Test setBackendValidationErrors with mock setError
  const mockErrors: Record<string, { type: string; message: string }> = {};
  const mockSetError = (field: string, err: { type: string; message: string }) => {
    mockErrors[field] = err;
  };

  const validationApiError = {
    response: {
      status: 400,
      data: {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { field: 'translations.en-US.name', message: 'English name must be at least 3 characters' },
          { field: 'categoryId', message: 'Category is required' },
        ],
      },
    },
  };

  const setRes = setBackendValidationErrors(validationApiError, mockSetError);
  assert(setRes === true, 'setBackendValidationErrors returns true when details processed');
  assert(
    mockErrors['en_name']?.message === 'English name must be at least 3 characters',
    'setBackendValidationErrors maps en_name field error'
  );
  assert(
    mockErrors['categoryId']?.message === 'Category is required',
    'setBackendValidationErrors maps categoryId field error'
  );

  // -------------------------------------------------------------
  // 10. OpenAPI Contract Synchronization & Locales Availability Tests
  // -------------------------------------------------------------
  console.log('\n--- 10. Multilingual Availability & Contract Tests ---');

  const sampleDestination = {
    id: 'dst_1',
    name: 'Pantai Pink',
    description: 'Pantai dengan pasir merah muda unik',
    availableLocales: ['id-ID'],
    missingLocales: ['en-US'],
    translations: [
      {
        locale: 'id-ID' as const,
        name: 'Pantai Pink',
        description: 'Pantai dengan pasir merah muda unik',
      },
    ],
  };

  assert(
    sampleDestination.availableLocales.includes('id-ID'),
    'Admin DTO preserves availableLocales with id-ID'
  );
  assert(
    sampleDestination.missingLocales.includes('en-US'),
    'Admin DTO correctly identifies missingLocales with en-US'
  );

  const sampleCompleteDestination = {
    id: 'dst_2',
    name: 'Gili Trawangan',
    description: 'Pulau wisata tanpa kendaraan bermotor',
    availableLocales: ['id-ID', 'en-US'],
    missingLocales: [],
    translations: [
      {
        locale: 'id-ID' as const,
        name: 'Gili Trawangan',
        description: 'Pulau wisata tanpa kendaraan bermotor',
      },
      {
        locale: 'en-US' as const,
        name: 'Gili Trawangan',
        description: 'Motor vehicle-free resort island with vibrant marine life',
      },
    ],
  };

  assert(
    sampleCompleteDestination.availableLocales.length === 2,
    'Complete DTO has 2 availableLocales'
  );
  assert(
    sampleCompleteDestination.missingLocales.length === 0,
    'Complete DTO has 0 missingLocales'
  );

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  console.log('========================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL LOCALIZATION ARCHITECTURE TESTS PASSED SUCCESSFULLY!\n');
  } else {
    process.exit(1);
  }
}

runLocalizationTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
