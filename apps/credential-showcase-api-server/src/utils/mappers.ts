import {
    Asset as AssetDTO,
    CredentialDefinition as CredentialDefinitionDTO,
    RelyingParty as RelyingPartyDTO,
    AssetRequest,
} from 'credential-showcase-openapi';
import {
    Asset,
    NewAsset,
    CredentialDefinition,
    RelyingParty
} from '../types';

export const newAssetFrom = (asset: AssetRequest): NewAsset => {
    return {
        ...asset,
        content: Buffer.from(asset.content)
    }
}

export const assetDTOFrom = (asset: Asset): AssetDTO => {
    return {
        ...asset,
        fileName: asset.fileName ? asset.fileName : undefined,
        description: asset.description ? asset.description : undefined,
        content: asset.content.toString()
    }
}

export const credentialDefinitionDTOFrom = (credentialDefinition: CredentialDefinition): CredentialDefinitionDTO => {
    return {
        ...credentialDefinition,
        revocation: credentialDefinition.revocation ? credentialDefinition.revocation : undefined,
        icon: assetDTOFrom(credentialDefinition.icon),
    }
}

export const relyingPartyDTOFrom = (relyingParty: RelyingParty): RelyingPartyDTO => {
    return {
        ...relyingParty,
        organization: relyingParty.organization ? relyingParty.organization : undefined,
        logo: relyingParty.logo ? assetDTOFrom(relyingParty.logo) : undefined,
        credentialDefinitions: relyingParty.credentialDefinitions.map(credentialDefinition => credentialDefinitionDTOFrom(credentialDefinition))
    }
}
