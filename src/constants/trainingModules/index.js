import { emailBasicsModule } from "./emailBasics";
import { redFlagsModule } from "./redFlags";
import { smishingModule } from "./smishing";
import { urlObfuscationModule } from "./urlObfuscation";
import { attachmentMalwareModule } from "./attachmentMalware";
import { spearPhishingModule } from "./spearPhishing";
import { becModule } from "./bec";
import { incidentResponseModule } from "./incidentResponse";
import { accountHardeningModule } from "./accountHardening";
import { advancedSocialModule } from "./advancedSocial";

export const MODULES = [
    emailBasicsModule,
    redFlagsModule,
    smishingModule,
    urlObfuscationModule,
    attachmentMalwareModule,
    spearPhishingModule,
    becModule,
    incidentResponseModule,
    accountHardeningModule,
    advancedSocialModule,
];
