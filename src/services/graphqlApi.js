import { gql } from '@apollo/client';
import { apolloClient } from './graphqlClient';

// =====================================================
// Queries
// =====================================================

const GET_PROPERTIES = gql`
  query GetProperties($search: String, $location: String, $minPrice: Decimal, $maxPrice: Decimal, $propertyType: String) {
    properties(search: $search, location: $location, minPrice: $minPrice, maxPrice: $maxPrice, propertyType: $propertyType) {
      id
      landlordId
      landlordName
      title
      description
      price
      location
      propertyType
      hasParking
      hasElevator
      isFurnished
      rentalStatus
      approvalStatus
      bedrooms
      bathrooms
      areaSqFt
      createdAt
      imageUrls
      averageRating
      reviewCount
    }
  }
`;

const GET_PROPERTY_BY_ID = gql`
  query GetPropertyById($id: Int!) {
    propertyById(id: $id) {
      id
      landlordId
      landlordName
      title
      description
      price
      location
      propertyType
      hasParking
      hasElevator
      isFurnished
      rentalStatus
      approvalStatus
      bedrooms
      bathrooms
      areaSqFt
      createdAt
      imageUrls
      averageRating
      reviewCount
    }
  }
`;

// =====================================================
// Mutations
// =====================================================

const CREATE_PROPERTY = gql`
  mutation CreateProperty($dto: CreatePropertyDtoInput!) {
    createProperty(dto: $dto) {
      id
      landlordId
      title
      description
      price
      location
      propertyType
      hasParking
      hasElevator
      isFurnished
      rentalStatus
      approvalStatus
      bedrooms
      bathrooms
      areaSqFt
      createdAt
      imageUrls
    }
  }
`;

const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($id: Int!, $dto: UpdatePropertyDtoInput!) {
    updateProperty(id: $id, dto: $dto) {
      id
      landlordId
      title
      description
      price
      location
      propertyType
      hasParking
      hasElevator
      isFurnished
      rentalStatus
      approvalStatus
      bedrooms
      bathrooms
      areaSqFt
      createdAt
      imageUrls
    }
  }
`;

const DELETE_PROPERTY = gql`
  mutation DeleteProperty($id: Int!) {
    deleteProperty(id: $id)
  }
`;

// =====================================================
// Query Functions
// =====================================================

/**
 * Fetch all available properties with optional filters via GraphQL.
 * Used by the tenant-facing Home page for browsing.
 */
export const getPropertiesGql = async (filters = {}) => {
  const variables = {};
  if (filters.search) variables.search = filters.search;
  if (filters.location) variables.location = filters.location;
  if (filters.minPrice) variables.minPrice = parseFloat(filters.minPrice);
  if (filters.maxPrice) variables.maxPrice = parseFloat(filters.maxPrice);
  if (filters.propertyType) variables.propertyType = filters.propertyType;

  const { data } = await apolloClient.query({
    query: GET_PROPERTIES,
    variables,
    fetchPolicy: 'network-only'
  });

  return data?.properties ?? [];
};

/**
 * Fetch a single property by ID via GraphQL.
 * Used by the PropertyView detail page.
 */
export const getPropertyByIdGql = async (id) => {
  const { data } = await apolloClient.query({
    query: GET_PROPERTY_BY_ID,
    variables: { id: Number(id) },
    fetchPolicy: 'network-only'
  });

  return data?.propertyById ?? null;
};

// =====================================================
// Mutation Functions
// =====================================================

/**
 * Create a new property via GraphQL mutation.
 * Used by the landlord "Add Property" form.
 */
export const createPropertyGql = async (propertyData) => {
  const dto = {
    title: propertyData.title,
    description: propertyData.description || '',
    price: parseFloat(propertyData.price),
    location: propertyData.location,
    propertyType: propertyData.propertyType || 'Apartment',
    hasParking: Boolean(propertyData.hasParking),
    hasElevator: Boolean(propertyData.hasElevator),
    isFurnished: Boolean(propertyData.isFurnished),
    bedrooms: parseInt(propertyData.bedrooms) || 0,
    bathrooms: parseInt(propertyData.bathrooms) || 0,
    areaSqFt: parseFloat(propertyData.areaSqFt) || 0
  };

  const { data } = await apolloClient.mutate({
    mutation: CREATE_PROPERTY,
    variables: { dto }
  });

  return data?.createProperty ?? null;
};

/**
 * Update an existing property via GraphQL mutation.
 * Used by the landlord "Edit Property" form.
 */
export const updatePropertyGql = async (id, propertyData) => {
  const dto = {
    title: propertyData.title,
    description: propertyData.description || '',
    price: parseFloat(propertyData.price),
    location: propertyData.location,
    propertyType: propertyData.propertyType || 'Apartment',
    hasParking: Boolean(propertyData.hasParking),
    hasElevator: Boolean(propertyData.hasElevator),
    isFurnished: Boolean(propertyData.isFurnished),
    bedrooms: parseInt(propertyData.bedrooms) || 0,
    bathrooms: parseInt(propertyData.bathrooms) || 0,
    areaSqFt: parseFloat(propertyData.areaSqFt) || 0
  };

  const { data } = await apolloClient.mutate({
    mutation: UPDATE_PROPERTY,
    variables: { id: Number(id), dto }
  });

  return data?.updateProperty ?? null;
};

/**
 * Delete a property via GraphQL mutation.
 * Used by the landlord property management page.
 */
export const deletePropertyGql = async (id) => {
  const { data } = await apolloClient.mutate({
    mutation: DELETE_PROPERTY,
    variables: { id: Number(id) }
  });

  return data?.deleteProperty ?? false;
};
