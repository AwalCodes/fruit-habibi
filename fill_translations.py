#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os

# Read English translations as reference
with open('src/lib/i18n/translations/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Comprehensive translations - using proper escaping
translations_data = {
    'fr': {
        'help': {
            'faqGettingStartedQ1': "Comment créer un compte?",
            'faqGettingStartedA1': "Cliquez sur 'Créer un compte' sur notre page d'accueil, remplissez vos informations professionnelles et vérifiez votre email. Complétez votre profil pour commencer à lister ou acheter des produits.",
            'faqGettingStartedQ2': "Quelles informations dois-je fournir pour vérifier mon compte?",
            'faqGettingStartedA2': "Nous demandons des documents d'enregistrement d'entreprise, une identification fiscale et des informations de contact. Pour les vendeurs, nous avons également besoin de certifications de qualité et de capacités d'expédition.",
            'faqGettingStartedQ3': "Combien de temps prend la vérification du compte?",
            'faqGettingStartedA3': "La vérification standard prend 1 à 3 jours ouvrables. La vérification premium avec support prioritaire prend 24 heures.",
            'faqBuyingSellingQ1': "Comment fonctionne le système de paiement?",
            'faqBuyingSellingA1': "Nous utilisons des paiements sécurisés en séquestre. Les fonds sont détenus jusqu'à la confirmation de livraison. Les acheteurs paient d'avance et les vendeurs reçoivent le paiement après une livraison réussie.",
            'faqBuyingSellingQ2': "Quels sont les frais de la plateforme?",
            'faqBuyingSellingA2': "Nous facturons une commission de 3% sur les transactions réussies. Les vendeurs premium (entreprises vérifiées) bénéficient de frais réduits de 2,5%.",
            'faqBuyingSellingQ3': "Comment lister mes produits?",
            'faqBuyingSellingA3': "Allez sur votre tableau de bord, cliquez sur 'Créer une annonce', téléchargez des images de haute qualité, ajoutez des descriptions détaillées, définissez les prix et spécifiez les options d'expédition.",
            'faqBuyingSellingQ4': "Puis-je négocier les prix?",
            'faqBuyingSellingA4': "Oui! Utilisez notre système de messagerie pour négocier directement avec les acheteurs/vendeurs. Les prix finaux sont mis à jour avant le traitement du paiement.",
            'faqShippingQ1': "Comment fonctionne l'expédition?",
            'faqShippingA1': "Les vendeurs spécifient les méthodes et les coûts d'expédition. Nous collaborons avec des prestataires logistiques mondiaux pour l'expédition internationale avec suivi.",
            'faqShippingQ2': "Que faire si mon produit arrive endommagé?",
            'faqShippingA2': "Signalez les dommages dans les 48 heures suivant la livraison. Nous lancerons un processus de résolution de litige et pourrons fournir des remboursements ou des remplacements.",
            'faqShippingQ3': "Gérez-vous l'expédition internationale?",
            'faqShippingA3': "Oui! Nous facilitons le commerce mondial avec la documentation douanière, des partenaires d'expédition internationaux et la conformité aux réglementations locales.",
            'faqSafetyQ1': "Comment vérifiez-vous les vendeurs?",
            'faqSafetyA1': "Nous vérifions les licences commerciales, les documents fiscaux, les certifications de qualité et effectuons des vérifications d'antécédents. Les vendeurs vérifiés obtiennent des badges spéciaux.",
            'faqSafetyQ2': "Que faire si un vendeur ne livre pas?",
            'faqSafetyA2': "Notre système de résolution de litiges gère les cas de non-livraison. Vous pouvez obtenir des remboursements complets et nous prenons des mesures contre les vendeurs problématiques.",
            'faqSafetyQ3': "Mes informations de paiement sont-elles sécurisées?",
            'faqSafetyA3': "Absolument. Nous utilisons un cryptage de niveau bancaire, la conformité PCI DSS, et ne stockons jamais vos détails de paiement complets sur nos serveurs.",
            'faqTechnicalQ1': "Je ne peux pas accéder à mon compte",
            'faqTechnicalA1': "Essayez de réinitialiser votre mot de passe ou contactez le support. Nous vérifierons votre identité et restaurerons l'accès dans les 24 heures.",
            'faqTechnicalQ2': "Le site web charge lentement",
            'faqTechnicalA2': "Vérifiez votre connexion Internet et videz le cache du navigateur. Si les problèmes persistent, contactez notre équipe de support technique.",
            'faqTechnicalQ3': "Comment mettre à jour mes informations professionnelles?",
            'faqTechnicalA3': "Allez dans les paramètres de votre profil, mettez à jour vos informations et soumettez pour une nouvelle vérification si vous avez modifié les détails de votre entreprise."
        }
    }
}

# Update French file
for lang in ['fr']:
    file_path = f'src/lib/i18n/translations/{lang}.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update help FAQ translations
    if lang in translations_data and 'help' in translations_data[lang]:
        for key, value in translations_data[lang]['help'].items():
            if key in data.get('help', {}):
                data['help'][key] = value
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"{lang.upper()} FAQ translations updated!")

print("French FAQ translations completed!")

