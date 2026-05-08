import { gql } from '@apollo/client';
import { apolloClient } from './graphqlClient';

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

const CREATE_PROPERTY = gql`
  mutation CreateProperty($dto: CreatePropertyDtoInput!) {
    createProperty(dto: $dto) {
      id
      landlordId
      title
      approvalStatus
    }
  }
`;

export const getPropertiesGql = async (filters = {}) => {
  const { data } = await apolloClient.query({
    query: GET_PROPERTIES,
    variables: filters,
    fetchPolicy: 'network-only'
  });

  return data?.properties ?? [];
};

export const getPropertyByIdGql = async (id) => {
  const { data } = await apolloClient.query({
    query: GET_PROPERTY_BY_ID,
    variables: { id: Number(id) }
  });

  return data?.propertyById ?? null;
};

export const createPropertyGql = async (propertyData) => {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_PROPERTY,
    variables: { dto: propertyData }
  });

  return data?.createProperty ?? null;
};
