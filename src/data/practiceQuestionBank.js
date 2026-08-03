/*
 * Hand-crafted SAT practice question bank.
 * Each question: { stem, choices, correct (0-based index), explanation }
 * Grouped by chapter ID matching getChaptersForExam() keys.
 */

// ──────────────────────────────────────────────────
//  SAT QUESTIONS  (~100 total, spread across chapters)
// ──────────────────────────────────────────────────
export const SAT_QUESTION_BANK = {

  /* ── 2.1  Words in Context ── */
  '2.1': [
    { stem: 'The architect\'s plans were deliberately "austere,"__(1)__ a style that emphasized clean lines and minimal ornamentation.\n\nAs used in the text, "austere" most nearly means:', choices: ['A) strict and demanding', 'B) severely plain and simple', 'C) hostile and unwelcoming', 'D) outdated and impractical'], correct: 1, explanation: 'In this context, "austere" describes a design approach characterized by simplicity and lack of decoration, making "severely plain and simple" the best fit.' },
    { stem: 'The researcher\'s findings were "preliminary," meaning the team would need to conduct further experiments before drawing any firm conclusions.\n\nAs used in the text, "preliminary" most nearly means:', choices: ['A) unimportant', 'B) initial and not yet final', 'C) incorrect', 'D) surprisingly thorough'], correct: 1, explanation: 'The context clue "would need to conduct further experiments" indicates that "preliminary" means the findings are early-stage and not yet conclusive.' },
    { stem: 'Although the novel received "modest" sales in its first year, it went on to become one of the best-selling books of the decade.\n\nAs used in the text, "modest" most nearly means:', choices: ['A) humble in character', 'B) relatively small or limited', 'C) morally proper', 'D) overly cautious'], correct: 1, explanation: 'Here "modest" describes sales numbers that were small, contrasting with the later success. It does not refer to humility or propriety.' },
    { stem: 'The diplomat\'s "measured" response to the crisis surprised those who expected a more emotional reaction.\n\nAs used in the text, "measured" most nearly means:', choices: ['A) quantified precisely', 'B) carefully considered and restrained', 'C) timed with a stopwatch', 'D) excessively slow'], correct: 1, explanation: 'The contrast with "more emotional reaction" shows that "measured" means deliberate and controlled, not literally quantified.' },
    { stem: 'The professor\'s lecture was "dense," packed with technical terminology and complex arguments that demanded careful attention.\n\nAs used in the text, "dense" most nearly means:', choices: ['A) physically heavy', 'B) slow to understand', 'C) concentrated and rich in content', 'D) dark and opaque'], correct: 2, explanation: 'The context describes content that is packed and demanding, indicating "dense" means concentrated and rich in content.' },
    { stem: 'Critics praised the filmmaker\'s "arresting" visual style, noting that every frame demanded the viewer\'s full attention.\n\nAs used in the text, "arresting" most nearly means:', choices: ['A) placing under detention', 'B) strikingly eye-catching', 'C) slowing down progress', 'D) legally questionable'], correct: 1, explanation: 'In this context, "arresting" means commanding attention -- strikingly eye-catching. The clue is "demanded the viewer\'s full attention."' },
    { stem: 'The treaty\'s "provisions" outlined specific rules for maritime commerce between the two nations.\n\nAs used in the text, "provisions" most nearly means:', choices: ['A) food and supplies', 'B) emergency backup plans', 'C) conditions or stipulations within an agreement', 'D) generous donations'], correct: 2, explanation: '"Provisions" in a legal or treaty context refers to specific conditions, clauses, or stipulations -- not food or supplies.' },
    { stem: 'The company\'s "robust" sales figures exceeded analysts\' expectations for the third consecutive quarter.\n\nAs used in the text, "robust" most nearly means:', choices: ['A) physically muscular', 'B) strong and healthy', 'C) aggressive and confrontational', 'D) artificially inflated'], correct: 1, explanation: 'In a business context, "robust" means strong and vigorous, indicating the sales figures were impressively healthy.' },
    { stem: 'The scientist\'s theory was "novel," presenting an explanation that no previous researcher had considered.\n\nAs used in the text, "novel" most nearly means:', choices: ['A) resembling a book', 'B) fictional and imaginary', 'C) new and original', 'D) controversial and disputed'], correct: 2, explanation: 'The context clue "no previous researcher had considered" indicates "novel" means new and original.' },
    { stem: 'The orchestra\'s performance was "pedestrian," failing to bring any excitement or originality to the well-known symphony.\n\nAs used in the text, "pedestrian" most nearly means:', choices: ['A) related to walking', 'B) dull and uninspired', 'C) dangerously fast', 'D) technically flawless'], correct: 1, explanation: '"Pedestrian" as an adjective means lacking inspiration or excitement -- dull and ordinary -- not literally about walking.' },
    { stem: 'The biologist described the species\' survival strategy as "ingenious," noting how effectively it had adapted to extreme desert conditions.\n\nAs used in the text, "ingenious" most nearly means:', choices: ['A) naively trusting', 'B) cleverly inventive', 'C) genetically modified', 'D) easily replicated'], correct: 1, explanation: 'The context shows the species adapted effectively to harsh conditions, indicating "ingenious" means cleverly inventive or resourceful.' },
    { stem: 'The politician\'s "equivocal" response left reporters unsure of her actual position on the proposed legislation.\n\nAs used in the text, "equivocal" most nearly means:', choices: ['A) equal and balanced', 'B) enthusiastically supportive', 'C) deliberately ambiguous', 'D) factually incorrect'], correct: 2, explanation: '"Equivocal" means deliberately vague or ambiguous, which is supported by the clue that reporters were "unsure of her actual position."' },
    { stem: 'The curator described the artifact as "seminal," arguing that it marked the beginning of an entirely new artistic movement.\n\nAs used in the text, "seminal" most nearly means:', choices: ['A) partially completed', 'B) highly influential and original', 'C) controversial among critics', 'D) ancient and deteriorating'], correct: 1, explanation: '"Seminal" means strongly influencing later developments. The clue "marked the beginning of an entirely new artistic movement" confirms this meaning.' },
    { stem: 'The author\'s tone throughout the essay was "sardonic," blending humor with sharp social criticism.\n\nAs used in the text, "sardonic" most nearly means:', choices: ['A) deeply sorrowful', 'B) grimly mocking', 'C) warmly affectionate', 'D) deliberately confusing'], correct: 1, explanation: '"Sardonic" describes humor that is mockingly cynical or scornful. The combination of humor and sharp criticism points to this meaning.' },
    { stem: 'Historians have called the treaty "provisional," noting that both sides understood it as a temporary arrangement until more permanent terms could be negotiated.\n\nAs used in the text, "provisional" most nearly means:', choices: ['A) related to a province', 'B) generously supplied', 'C) temporary and conditional', 'D) unanimously approved'], correct: 2, explanation: 'The context clue "temporary arrangement until more permanent terms could be negotiated" directly defines "provisional" as temporary and conditional.' },
    { stem: 'The journalist\'s "incisive" reporting cut through the political spin to reveal the underlying facts of the scandal.\n\nAs used in the text, "incisive" most nearly means:', choices: ['A) physically cutting', 'B) impressively lengthy', 'C) penetratingly clear and sharp', 'D) aggressively hostile'], correct: 2, explanation: '"Incisive" means analytically sharp and clear. The metaphor of cutting "through the political spin" reinforces this meaning of perceptive clarity.' },
    { stem: 'The CEO described the merger as "synergistic," predicting that the combined company would achieve more together than either could alone.\n\nAs used in the text, "synergistic" most nearly means:', choices: ['A) artificially created', 'B) producing a combined effect greater than the sum of separate effects', 'C) competitive and aggressive', 'D) financially risky'], correct: 1, explanation: 'The clue "achieve more together than either could alone" defines synergy -- a combined effect exceeding individual contributions.' },
    { stem: 'The historian noted that the general\'s retreat was "prudent," saving thousands of soldiers who would have been lost in a futile assault.\n\nAs used in the text, "prudent" most nearly means:', choices: ['A) cowardly', 'B) showing careful good judgment', 'C) hasty and impulsive', 'D) morally questionable'], correct: 1, explanation: 'The context shows the retreat saved lives, indicating it was a wise decision. "Prudent" means showing good judgment and foresight.' },
    { stem: 'The author\'s argument was "tenuous," relying on a single unverified source and several logical leaps.\n\nAs used in the text, "tenuous" most nearly means:', choices: ['A) lengthy and detailed', 'B) weak and poorly supported', 'C) firmly established', 'D) emotionally persuasive'], correct: 1, explanation: '"Unverified source" and "logical leaps" indicate a weak foundation, making "tenuous" mean weakly supported or flimsy.' },
    { stem: 'The scientist\'s discovery was "fortuitous," arising from an accident in the laboratory rather than from deliberate experimentation.\n\nAs used in the text, "fortuitous" most nearly means:', choices: ['A) unfortunate', 'B) happening by lucky chance', 'C) carefully planned', 'D) widely anticipated'], correct: 1, explanation: 'The clue "arising from an accident" rather than "deliberate experimentation" shows the discovery happened by chance. "Fortuitous" means occurring by happy accident.' },
    { stem: 'The critic found the director\'s latest film "derivative," noting that nearly every scene seemed borrowed from earlier, better movies.\n\nAs used in the text, "derivative" most nearly means:', choices: ['A) mathematically complex', 'B) unoriginal, imitating the work of others', 'C) shocking and provocative', 'D) commercially successful'], correct: 1, explanation: 'The clue "every scene seemed borrowed" indicates the film lacks originality. "Derivative" means imitative of others\' work.' },
    { stem: 'The author\'s "candid" memoir revealed personal failures and struggles that most public figures would prefer to keep hidden.\n\nAs used in the text, "candid" most nearly means:', choices: ['A) photographic', 'B) secretive and guarded', 'C) honest and straightforward', 'D) carefully edited'], correct: 2, explanation: 'Revealing failures that others would hide indicates openness and honesty. "Candid" means frank and honest.' },
    { stem: 'The negotiations were "protracted," stretching over 18 months as both sides struggled to find common ground.\n\nAs used in the text, "protracted" most nearly means:', choices: ['A) productive and efficient', 'B) secret and hidden', 'C) drawn out over a long period', 'D) completed ahead of schedule'], correct: 2, explanation: 'The clue "stretching over 18 months" indicates the negotiations lasted a long time. "Protracted" means extended or prolonged.' },
    { stem: 'The town\'s economy was "stagnant," with unemployment unchanged and no new businesses opening for three consecutive years.\n\nAs used in the text, "stagnant" most nearly means:', choices: ['A) rapidly growing', 'B) showing no activity or growth', 'C) highly competitive', 'D) recovering slowly'], correct: 1, explanation: 'Unchanged unemployment and no new businesses indicate a lack of growth or progress, which is the meaning of "stagnant."' },
    { stem: 'The defense attorney called the evidence "circumstantial," arguing that it suggested but did not prove her client\'s involvement in the crime.\n\nAs used in the text, "circumstantial" most nearly means:', choices: ['A) fabricated and unreliable', 'B) direct and conclusive', 'C) based on inference rather than direct proof', 'D) obtained illegally'], correct: 2, explanation: 'The clue "suggested but did not prove" defines circumstantial evidence as pointing toward a conclusion without directly establishing it.' },
    { stem: 'The sculptor described her creative process as "intuitive," explaining that she rarely planned her compositions in advance but instead let the material guide her decisions.\n\nAs used in the text, "intuitive" most nearly means:', choices: ['A) illogical and random', 'B) guided by instinct rather than deliberate planning', 'C) requiring extensive training', 'D) scientifically rigorous'], correct: 1, explanation: 'The context clue "rarely planned" and "let the material guide her" indicates that "intuitive" means driven by instinct rather than formal planning.' },
    { stem: 'The politician\'s speech was "incendiary," provoking strong reactions from both supporters and opponents.\n\nAs used in the text, "incendiary" most nearly means:', choices: ['A) related to fire prevention', 'B) carefully balanced', 'C) inflammatory and provocative', 'D) long and tedious'], correct: 2, explanation: '"Provoking strong reactions" indicates that "incendiary" means inflammatory, designed to stir up strong emotions.' },
    { stem: 'The historian praised the archive for its "exhaustive" collection of primary sources, noting that researchers could find documents covering every major event of the period.\n\nAs used in the text, "exhaustive" most nearly means:', choices: ['A) tiresome and boring', 'B) comprehensive and thorough', 'C) physically draining', 'D) carelessly assembled'], correct: 1, explanation: 'The context clue "every major event" indicates completeness. "Exhaustive" here means comprehensive and thorough, not physically tiring.' },
  ],

  /* ── 2.2  Text Structure & Purpose ── */
  '2.2': [
    { stem: 'A marine biologist writes: "While coral reefs cover less than 1% of the ocean floor, they support approximately 25% of all marine species. This extraordinary density of biodiversity makes reef conservation not merely desirable but essential."\n\nThe primary purpose of the statistic in the first sentence is to:', choices: ['A) provide a counterargument to reef conservation', 'B) establish the disproportionate ecological importance of reefs', 'C) compare reefs to other ocean ecosystems', 'D) suggest that the ocean floor is mostly barren'], correct: 1, explanation: 'The statistic (less than 1% of floor but 25% of species) highlights the outsized ecological role of reefs, directly supporting the argument for conservation.' },
    { stem: 'A passage opens with a vivid description of a thunderstorm before transitioning to a discussion of atmospheric science. The opening description primarily serves to:', choices: ['A) argue that storms are dangerous', 'B) engage the reader before introducing technical content', 'C) demonstrate the author\'s creative writing ability', 'D) provide evidence for a later scientific claim'], correct: 1, explanation: 'Starting with vivid description is a common technique for drawing readers into what might otherwise be dry scientific material.' },
    { stem: 'In an essay about urban planning, the author presents two case studies side by side. This organizational structure most likely serves to:', choices: ['A) show that urban planning always fails', 'B) highlight similarities and differences between approaches', 'C) confuse the reader with contradictory evidence', 'D) prove that only one city matters'], correct: 1, explanation: 'Presenting case studies side by side is a compare-and-contrast structure designed to illuminate how different approaches work.' },
    { stem: 'A historian begins a chapter with a direct quotation from a factory worker in 1912 before analyzing labor reforms of that era. The quotation primarily serves to:', choices: ['A) prove that all factory workers were unhappy', 'B) ground the historical analysis in a personal, concrete experience', 'C) demonstrate the author\'s archival research skills', 'D) argue against labor reform'], correct: 1, explanation: 'Opening with a firsthand voice makes the historical analysis feel immediate and grounded, connecting abstract reform discussion to lived experience.' },
    { stem: 'A scientific article about deep-sea organisms ends with a series of unanswered questions. This concluding strategy most likely serves to:', choices: ['A) admit that the research was a failure', 'B) suggest directions for future investigation', 'C) discourage other researchers from the topic', 'D) summarize all previous findings'], correct: 1, explanation: 'Ending with open questions is a common technique in scientific writing to highlight the need for further research and signal that the field is still developing.' },
    { stem: 'An economist begins a chapter with a detailed description of a single factory closing, then broadens to discuss nationwide trends in manufacturing decline. This organizational strategy primarily serves to:', choices: ['A) argue that all factories should close', 'B) move from a specific, relatable example to a broader analysis', 'C) prove that the economist visited the factory personally', 'D) compare factories in different countries'], correct: 1, explanation: 'Starting with a concrete example before broadening to larger trends is a common technique that grounds abstract analysis in a specific, relatable case.' },
    { stem: 'A passage about climate science presents a series of data points, each followed by a brief interpretation. This structure primarily serves to:', choices: ['A) overwhelm the reader with numbers', 'B) help the reader understand the significance of each piece of evidence', 'C) prove that the author is a mathematician', 'D) contradict the main argument'], correct: 1, explanation: 'Pairing data with interpretation helps readers process complex information by explaining the meaning of each finding as it appears.' },
    { stem: 'An author writing about ancient Rome begins by describing a modern city\'s infrastructure problems, then draws parallels to similar challenges faced by the Romans. This technique primarily serves to:', choices: ['A) argue that modern cities are worse than ancient ones', 'B) make historical material feel relevant by connecting it to contemporary experience', 'C) demonstrate that nothing has changed in 2,000 years', 'D) criticize modern urban planning'], correct: 1, explanation: 'Connecting historical content to present-day issues makes the material more relevant and engaging for contemporary readers.' },
    { stem: 'A literary critic structures a review by first summarizing the plot, then analyzing the themes, and finally evaluating the author\'s craft. This organization is best described as:', choices: ['A) moving from description to analysis to evaluation', 'B) chronological', 'C) cause and effect', 'D) problem and solution'], correct: 0, explanation: 'The structure moves through three distinct levels: describing what happens, analyzing why it matters, and evaluating how well it is executed.' },
    { stem: 'A public health article begins with a startling statistic: "Every 40 seconds, someone in the world dies by suicide." The author most likely opens with this statistic to:', choices: ['A) frighten readers into inaction', 'B) immediately establish the urgency and scale of the issue', 'C) prove that the data collection methods are reliable', 'D) compare suicide rates across different countries'], correct: 1, explanation: 'Opening with a startling statistic is a rhetorical strategy designed to capture attention and convey the urgency of the topic.' },
    { stem: 'A passage about renewable energy alternates between describing the benefits of solar power and the benefits of wind power. This structure most likely serves to:', choices: ['A) argue that solar is better than wind', 'B) provide a balanced overview of two complementary energy sources', 'C) confuse the reader about which is preferable', 'D) criticize fossil fuels'], correct: 1, explanation: 'Alternating between two related subjects allows the author to present a balanced, comprehensive view of both options.' },
    { stem: 'An essay about voting rights ends with a call to action urging readers to contact their elected officials. This concluding strategy is most accurately described as:', choices: ['A) summarizing the main points', 'B) shifting from informing the reader to persuading the reader to act', 'C) introducing a new topic', 'D) providing additional historical background'], correct: 1, explanation: 'A call to action at the end of an essay transitions from presenting information to urging the audience to take specific steps, making it persuasive.' },
    { stem: 'A passage about artificial intelligence opens with a brief history of computing, then describes current AI capabilities, and concludes with predictions about AI\'s future impact. This structure is best described as:', choices: ['A) compare and contrast', 'B) chronological, moving from past to present to future', 'C) problem and solution', 'D) argument and counterargument'], correct: 1, explanation: 'Moving from history to current capabilities to future predictions follows a chronological structure: past, present, future.' },
    { stem: 'A psychology article presents a case study of one patient in detail before discussing broader research findings. The case study primarily serves to:', choices: ['A) prove that the broader findings are wrong', 'B) provide a concrete, humanizing example that makes the abstract research tangible', 'C) show that the researcher only studied one person', 'D) distract the reader from the main argument'], correct: 1, explanation: 'Opening with a specific case study grounds abstract research in a relatable human experience, making the broader findings more accessible.' },
    { stem: 'An environmental report uses footnotes throughout to cite data sources. The footnotes primarily serve to:', choices: ['A) pad the report\'s length', 'B) allow readers to verify the report\'s claims by checking the original sources', 'C) show that the author read many books', 'D) provide entertainment for the reader'], correct: 1, explanation: 'Footnotes with source citations allow readers to verify claims independently, enhancing the report\'s credibility and transparency.' },
    { stem: 'A memoir opens with a scene from the author\'s childhood, then jumps forward to describe a pivotal event in adulthood, before returning to the childhood scene with new context. This structure primarily serves to:', choices: ['A) confuse the reader with an unclear timeline', 'B) show how a later experience reshaped the author\'s understanding of an earlier one', 'C) prove the author has a good memory', 'D) make the memoir seem longer'], correct: 1, explanation: 'Framing a childhood scene with adult perspective shows how later experience changes the interpretation of earlier events -- a common memoir technique.' },
    { stem: 'An article about urban farming presents statistics about food deserts alongside personal stories from community gardeners. The combination of data and narrative primarily serves to:', choices: ['A) demonstrate that statistics are unreliable', 'B) provide both empirical evidence and human context for the issue', 'C) argue that gardening is more important than policy', 'D) fill space in the article'], correct: 1, explanation: 'Combining data with personal stories provides both analytical rigor and emotional resonance, giving readers both evidence and human context.' },
    { stem: 'A scientific paper includes a "Limitations" section acknowledging potential weaknesses in the study. This section primarily serves to:', choices: ['A) undermine the paper\'s conclusions entirely', 'B) demonstrate intellectual honesty and help readers evaluate the strength of the findings', 'C) discourage other researchers from replicating the study', 'D) satisfy a formatting requirement with no real purpose'], correct: 1, explanation: 'Acknowledging limitations is a hallmark of rigorous scientific writing, demonstrating honesty and helping readers contextualize the findings appropriately.' },
  ],

  /* ── 2.3  Cross-Text Connections ── */
  '2.3': [
    { stem: 'Text 1 argues that social media has expanded democratic participation by giving citizens new ways to organize. Text 2 contends that social media platforms often amplify extreme viewpoints at the expense of moderate dialogue.\n\nHow would the author of Text 2 most likely respond to the claim in Text 1?', choices: ['A) By agreeing that social media is entirely beneficial', 'B) By acknowledging the participation benefit but questioning whether it leads to productive discourse', 'C) By arguing that citizens should not be allowed to organize', 'D) By denying that social media exists'], correct: 1, explanation: 'Text 2\'s concern about amplified extremism suggests its author would accept that participation increases but question whether the resulting discourse is constructive.' },
    { stem: 'Text 1 presents data showing that remote work increases individual productivity. Text 2 presents data showing that remote work decreases team collaboration and innovation.\n\nWhich statement best describes the relationship between the two texts?', choices: ['A) They contradict each other completely', 'B) They examine different aspects of the same phenomenon and reach different conclusions', 'C) Text 2 provides evidence that supports Text 1', 'D) Text 1 is about remote work while Text 2 is about office work'], correct: 1, explanation: 'Both texts address remote work, but they measure different outcomes (individual productivity vs. team collaboration), which accounts for their different conclusions.' },
    { stem: 'Text 1 describes the archaeological evidence for an ancient trade route. Text 2 questions whether the artifacts found could have arrived through other means, such as gift exchange.\n\nThe author of Text 2 would most likely characterize the conclusion of Text 1 as:', choices: ['A) well-supported and definitive', 'B) plausible but insufficiently proven', 'C) entirely fabricated', 'D) irrelevant to archaeology'], correct: 1, explanation: 'Text 2 offers an alternative explanation, which suggests its author views Text 1\'s conclusion as possible but not the only interpretation of the evidence.' },
    { stem: 'Text 1 argues that bilingual education helps children develop stronger cognitive skills. Text 2 argues that immersion-only programs produce faster fluency in the target language.\n\nThe two texts primarily differ in their emphasis on:', choices: ['A) which country\'s education system is best', 'B) the relative importance of cognitive development versus language acquisition speed', 'C) whether children should attend school at all', 'D) the cost of educational programs'], correct: 1, explanation: 'Text 1 prioritizes broad cognitive benefits while Text 2 prioritizes speed of fluency. Their disagreement centers on which educational outcome matters more.' },
    { stem: 'Text 1 presents evidence that coffee consumption has health benefits, citing reduced risks of certain diseases. Text 2 warns that excessive caffeine intake can cause anxiety, insomnia, and heart palpitations.\n\nBased on both texts, which statement would both authors most likely agree with?', choices: ['A) Coffee should be banned entirely.', 'B) The amount of coffee consumed matters when evaluating its effects.', 'C) Coffee has no effect on health whatsoever.', 'D) All scientific studies about coffee are flawed.'], correct: 1, explanation: 'Text 1 notes benefits and Text 2 warns about excess. Both implicitly acknowledge that dosage matters, making moderation a point of potential agreement.' },
    { stem: 'Text 1 argues that zoos play a critical role in species conservation by maintaining breeding programs for endangered animals. Text 2 argues that keeping wild animals in captivity is inherently unethical, regardless of conservation goals.\n\nThe relationship between the two texts is best described as:', choices: ['A) Text 2 provides supporting evidence for Text 1.', 'B) The texts present fundamentally different ethical frameworks for evaluating the same practice.', 'C) Both texts agree that zoos are beneficial.', 'D) Text 1 responds directly to the arguments in Text 2.'], correct: 1, explanation: 'Text 1 evaluates zoos through a conservation lens (do they save species?), while Text 2 evaluates them through an animal rights lens (is captivity ethical?). They use different ethical frameworks.' },
    { stem: 'Text 1 claims that standardized testing provides objective data for comparing student achievement across schools. Text 2 argues that standardized tests primarily measure socioeconomic background rather than true academic ability.\n\nHow would the author of Text 2 most likely respond to the claim in Text 1?', choices: ['A) By agreeing that the data is objective and useful', 'B) By arguing that the data reflects inequality rather than genuine achievement differences', 'C) By suggesting that no assessment is possible', 'D) By proposing that all tests should be harder'], correct: 1, explanation: 'Text 2\'s argument that tests measure socioeconomic background suggests its author would view cross-school comparison data as reflecting economic disparities rather than real achievement gaps.' },
    { stem: 'Text 1 presents a theory that the ancient city collapsed due to environmental degradation caused by deforestation. Text 2 presents evidence that the city was conquered by a neighboring empire.\n\nWhich statement best describes how the authors would likely view each other\'s arguments?', choices: ['A) Each would view the other\'s argument as impossible.', 'B) Each would view the other\'s argument as a partial explanation that does not tell the whole story.', 'C) Both would agree that only one cause is possible.', 'D) Neither would acknowledge the other\'s evidence.'], correct: 1, explanation: 'Complex historical events often have multiple causes. Each author would likely acknowledge the other\'s evidence while maintaining that their own factor was more significant.' },
    { stem: 'Text 1 argues that artificial intelligence will create more jobs than it eliminates by opening entirely new industries. Text 2 warns that AI-driven automation will disproportionately affect low-wage workers who lack resources to retrain.\n\nThe two texts primarily differ in their focus on:', choices: ['A) whether AI technology actually works', 'B) the net economic impact versus the distributional impact of AI on the workforce', 'C) which companies will profit most from AI', 'D) whether governments should ban AI development'], correct: 1, explanation: 'Text 1 focuses on the overall net effect (more jobs created than lost), while Text 2 focuses on who specifically will be harmed. They differ on aggregate versus distributional analysis.' },
    { stem: 'Text 1 describes how a particular teaching method improved test scores in a controlled study. Text 2 argues that the same method is impractical to implement in most real-world classrooms due to resource constraints.\n\nBased on both texts, which conclusion is most reasonable?', choices: ['A) The teaching method has no value.', 'B) The method\'s effectiveness in research settings may not easily transfer to typical classrooms.', 'C) All research studies are flawed.', 'D) Resource constraints are irrelevant to education.'], correct: 1, explanation: 'Text 1 shows the method works in controlled settings, and Text 2 highlights real-world barriers. Together, they suggest the method\'s lab success may not translate easily to typical classrooms.' },
    { stem: 'Text 1 celebrates the rise of social media as a tool for grassroots activism and political organizing. Text 2 presents research showing that social media engagement often substitutes for rather than leads to real-world political participation.\n\nThe author of Text 2 would most likely describe the activism praised in Text 1 as:', choices: ['A) the most effective form of political engagement', 'B) potentially superficial if it replaces rather than supplements traditional forms of civic action', 'C) completely irrelevant to political outcomes', 'D) dangerous and destabilizing'], correct: 1, explanation: 'Text 2\'s concern is about substitution -- online engagement replacing real-world action. Its author would likely worry that what Text 1 celebrates may be superficial if it does not lead to tangible civic participation.' },
    { stem: 'Text 1 argues that universal basic income (UBI) would give people financial security to pursue education and entrepreneurship. Text 2 argues that UBI would reduce the incentive to work and lead to labor shortages.\n\nWhich statement best describes the fundamental disagreement between the two texts?', choices: ['A) Whether money has value in modern economies', 'B) Whether financial security encourages or discourages productive activity', 'C) Whether governments should collect taxes', 'D) Whether education is important'], correct: 1, explanation: 'Text 1 assumes financial security enables productive choices (education, entrepreneurship), while Text 2 assumes it reduces motivation to work. The core disagreement is about how financial security affects behavior.' },
    { stem: 'Text 1 presents data showing that organic farming produces lower yields per acre than conventional farming. Text 2 argues that organic farming produces healthier food and protects soil for future generations.\n\nBased on both texts, which conclusion is most reasonable?', choices: ['A) Organic farming is clearly superior to conventional farming.', 'B) Evaluating farming methods requires considering both short-term productivity and long-term sustainability.', 'C) Conventional farming has no environmental impact.', 'D) Yield per acre is the only important metric for farming.'], correct: 1, explanation: 'Text 1 focuses on yield (short-term productivity) while Text 2 focuses on health and soil (long-term sustainability). Together, they suggest both dimensions matter.' },
  ],

  /* ── 3.1  Central Ideas & Literalism ── */
  '3.1': [
    { stem: 'A passage describes how the introduction of wolves into Yellowstone National Park led to changes in elk behavior, which allowed vegetation to recover along riverbanks, which in turn stabilized the rivers\' courses.\n\nWhich choice best states the main idea of the passage?', choices: ['A) Wolves are the most important predator in North America.', 'B) The reintroduction of a single species can trigger a cascade of ecological changes.', 'C) Elk populations should be reduced in all national parks.', 'D) Rivers in Yellowstone flow in unpredictable directions.'], correct: 1, explanation: 'The passage traces a chain reaction from wolves to elk to vegetation to rivers, illustrating a trophic cascade -- the idea that one species\' return can reshape an entire ecosystem.' },
    { stem: 'A historian argues that the printing press did not merely speed up book production but fundamentally changed how knowledge was transmitted, standardized, and preserved across generations.\n\nWhich choice best captures the central claim?', choices: ['A) The printing press was faster than hand-copying.', 'B) The printing press transformed the nature of knowledge itself, not just its speed of production.', 'C) Hand-copied manuscripts were always inaccurate.', 'D) The printing press was invented in Germany.'], correct: 1, explanation: 'The key word is "fundamentally changed." The author\'s point goes beyond speed to argue that the press altered how knowledge works.' },
    { stem: 'A sociologist studying neighborhood gardens concludes that the gardens\' primary value is not the food they produce but the social connections they foster among residents.\n\nWhich finding, if true, would most directly support this conclusion?', choices: ['A) Most garden plots produce fewer vegetables than a typical grocery trip would provide.', 'B) Residents who participate in the garden program report stronger relationships with their neighbors.', 'C) The cost of seeds has risen by 15% over the past decade.', 'D) Some residents prefer to garden alone at home.'], correct: 1, explanation: 'The conclusion is about social connections, so evidence that gardeners report stronger neighbor relationships directly supports it.' },
    { stem: 'A neuroscientist explains that the brain\'s prefrontal cortex, which governs decision-making and impulse control, is not fully developed until approximately age 25.\n\nWhich choice best states the main idea?', choices: ['A) The brain stops growing after childhood.', 'B) A key brain region responsible for judgment matures later than most people assume.', 'C) Teenagers are incapable of making any decisions.', 'D) The prefrontal cortex is the largest part of the brain.'], correct: 1, explanation: 'The passage\'s central point is that the brain region governing judgment develops later than expected, until around age 25.' },
    { stem: 'A passage describes how the construction of the transcontinental railroad in the 1860s connected distant markets, reduced shipping costs, and accelerated westward migration.\n\nWhich choice best captures the central idea?', choices: ['A) The railroad was expensive to build.', 'B) The transcontinental railroad fundamentally reshaped American economic geography and settlement patterns.', 'C) Trains are faster than horses.', 'D) The railroad was completed in 1869.'], correct: 1, explanation: 'The passage traces multiple large-scale effects -- connected markets, reduced costs, increased migration -- indicating the railroad reshaped the nation\'s economy and geography.' },
    { stem: 'A passage argues that the development of written language around 3200 BCE did not simply record existing knowledge but created entirely new forms of thought, including abstract mathematics, legal codes, and historical narrative.\n\nWhich choice best states the main idea?', choices: ['A) Writing was invented around 3200 BCE.', 'B) Writing was a cognitive revolution that enabled new categories of thought, not merely a recording tool.', 'C) Mathematics existed before writing.', 'D) Legal codes are the most important form of writing.'], correct: 1, explanation: 'The key claim is that writing did not just record thought but created new forms of it -- a distinction between passive recording and active cognitive transformation.' },
    { stem: 'A passage discusses how honeybees use a "waggle dance" to communicate the direction and distance of food sources to other bees in the hive.\n\nWhich choice best states the main idea?', choices: ['A) Bees produce honey from nectar.', 'B) Honeybees have evolved a sophisticated communication system that conveys precise spatial information.', 'C) All insects can dance.', 'D) Bees travel long distances to find food.'], correct: 1, explanation: 'The passage focuses on the waggle dance as a communication system that transmits spatial data, highlighting its sophistication.' },
    { stem: 'A passage explains that while many people associate the Scientific Revolution with individual geniuses like Newton and Galileo, the transformation was equally dependent on institutional changes, such as the founding of scientific societies and the development of peer review.\n\nWhich choice best captures the central idea?', choices: ['A) Newton was the greatest scientist in history.', 'B) The Scientific Revolution resulted from institutional and cultural shifts, not just individual brilliance.', 'C) Peer review is a modern invention.', 'D) Scientific societies are no longer important.'], correct: 1, explanation: 'The passage argues against the "lone genius" narrative by highlighting institutional factors, making B the best summary of its central claim.' },
    { stem: 'A passage about urban heat islands explains that cities are significantly warmer than surrounding rural areas because buildings and pavement absorb and re-radiate heat, while the lack of vegetation reduces natural cooling.\n\nWhich finding, if true, would most directly support the passage\'s explanation?', choices: ['A) Cities have more restaurants than rural areas.', 'B) Neighborhoods with extensive tree cover are measurably cooler than nearby neighborhoods with minimal vegetation.', 'C) Rural areas have lower population densities.', 'D) Some cities experience heavy snowfall in winter.'], correct: 1, explanation: 'If neighborhoods with more trees are cooler than those without, it directly supports the claim that vegetation provides natural cooling and its absence contributes to urban heat.' },
    { stem: 'A psychologist argues that procrastination is not a time management problem but an emotional regulation problem -- people delay tasks to avoid negative emotions such as anxiety or boredom.\n\nWhich choice best states the central claim?', choices: ['A) Everyone procrastinates equally.', 'B) Procrastination is driven by emotional avoidance rather than poor scheduling.', 'C) Boredom is the most serious human emotion.', 'D) Time management apps are useless.'], correct: 1, explanation: 'The central claim reframes procrastination from a practical problem (scheduling) to a psychological one (emotional avoidance), which B captures precisely.' },
    { stem: 'A passage describes how the invention of the microscope in the 17th century revealed an invisible world of microorganisms, fundamentally changing humanity\'s understanding of disease, biology, and the limits of human perception.\n\nWhich choice best captures the central idea?', choices: ['A) Microscopes are expensive instruments.', 'B) The microscope expanded human knowledge by making the previously invisible visible, transforming multiple scientific fields.', 'C) Microorganisms cause all diseases.', 'D) The 17th century was the most important century in history.'], correct: 1, explanation: 'The passage traces the microscope\'s impact across disease understanding, biology, and perception, showing how making the invisible visible transformed knowledge broadly.' },
    { stem: 'A passage about ocean acidification explains that rising CO2 levels in the atmosphere are causing the oceans to become more acidic, which threatens marine organisms with calcium carbonate shells, including coral, clams, and some plankton species.\n\nWhich choice best states the main idea?', choices: ['A) The ocean contains many species of plankton.', 'B) Atmospheric CO2 increases are altering ocean chemistry in ways that endanger key marine organisms.', 'C) Coral reefs are beautiful.', 'D) Carbon dioxide is a common gas.'], correct: 1, explanation: 'The passage links atmospheric CO2 to ocean acidification to its impact on specific marine organisms, making B the best summary of the cause-effect chain.' },
    { stem: 'A sociologist argues that social media has not created new forms of loneliness but has instead made pre-existing loneliness more visible by giving isolated individuals a platform to express their experiences.\n\nWhich choice best states the central claim?', choices: ['A) Social media causes loneliness.', 'B) Social media reveals rather than creates loneliness, making an existing problem more visible.', 'C) Everyone who uses social media is lonely.', 'D) Social media has no effect on mental health.'], correct: 1, explanation: 'The key distinction is between creating and revealing loneliness. The sociologist argues social media makes existing loneliness visible, not that it generates new loneliness.' },
    { stem: 'A passage explains that ancient Egyptian workers who built the pyramids were not slaves, as commonly believed, but paid laborers who received food, beer, medical care, and housing as compensation.\n\nWhich finding, if true, would most directly support this conclusion?', choices: ['A) The pyramids took many years to build.', 'B) Archaeological excavations near the pyramids uncovered workers\' villages with bakeries, hospitals, and burial sites with honors typically reserved for respected citizens.', 'C) Egypt had a large population in ancient times.', 'D) Some ancient civilizations used slave labor.'], correct: 1, explanation: 'Discovering well-equipped villages with bakeries, hospitals, and honored burials directly supports the claim that workers were valued employees, not enslaved people.' },
    { stem: 'A passage argues that the development of agriculture around 10,000 years ago did not immediately improve human health. In fact, early farmers had shorter statures, more dental problems, and more nutritional deficiencies than hunter-gatherers.\n\nWhich choice best states the main idea?', choices: ['A) Agriculture was invented 10,000 years ago.', 'B) The shift to agriculture initially worsened human health despite securing a more reliable food supply.', 'C) Hunter-gatherers never ate grains.', 'D) Dental problems are caused by sugar.'], correct: 1, explanation: 'The passage contrasts the assumed benefit of agriculture with evidence of worse health outcomes, arguing that the transition initially harmed rather than helped human well-being.' },
    { stem: 'A passage explains that the concept of "wilderness" as untouched nature is largely a modern invention. Indigenous peoples actively managed landscapes through controlled burns, selective planting, and animal husbandry for thousands of years.\n\nWhich choice best captures the central idea?', choices: ['A) Indigenous peoples invented fire.', 'B) What modern societies perceive as wilderness was often a landscape actively shaped by Indigenous land management.', 'C) All forests are the same age.', 'D) Controlled burns are dangerous.'], correct: 1, explanation: 'The passage challenges the idea of "untouched" wilderness by showing that Indigenous peoples actively shaped these landscapes through deliberate management practices.' },
  ],

  /* ── 3.2  Command of Evidence: Textual ── */
  '3.2': [
    { stem: 'A literary critic claims that the protagonist of a novel undergoes a fundamental change in values over the course of the story. Which quotation from the novel would best support this claim?', choices: ['A) "She walked to school the same way she always had."', 'B) "For the first time, she realized that winning mattered less than the people she had hurt along the way."', 'C) "The weather that day was unusually warm for October."', 'D) "Her brother arrived home at the usual time."'], correct: 1, explanation: 'The phrase "for the first time" and the shift from valuing winning to caring about people she hurt demonstrates a fundamental change in values.' },
    { stem: 'A student claims that the passage\'s author is skeptical of a new technology. Which quotation from the passage best supports this claim?', choices: ['A) "The device has been adopted by millions worldwide."', 'B) "The technology promises much, but its long-term effects remain poorly understood and potentially troubling."', 'C) "Engineers spent three years developing the prototype."', 'D) "Sales exceeded expectations in the first quarter."'], correct: 1, explanation: '"Promises much" concedes a benefit, but "poorly understood and potentially troubling" expresses clear skepticism about the technology.' },
    { stem: 'A researcher argues that ancient Polynesians were highly skilled navigators. Which piece of evidence from the text would most effectively support this argument?', choices: ['A) Polynesians lived on islands.', 'B) Polynesian navigators crossed thousands of miles of open ocean using stars, wave patterns, and bird behavior -- without instruments.', 'C) Some Polynesian islands have tropical climates.', 'D) Modern GPS technology is very accurate.'], correct: 1, explanation: 'Crossing vast distances using natural cues without instruments directly demonstrates advanced navigational skill.' },
    { stem: 'A student claims that the author of a passage views automation as a double-edged sword. Which quotation best supports this claim?', choices: ['A) "Factory output has increased significantly in the last decade."', 'B) "While automation has boosted productivity and reduced errors, it has also displaced workers who lack the training to transition to new roles."', 'C) "Many companies plan to invest in new machinery next year."', 'D) "The price of industrial robots has fallen by 40%."'], correct: 1, explanation: 'The quotation explicitly presents both a benefit (boosted productivity) and a drawback (displaced workers), supporting the "double-edged sword" characterization.' },
    { stem: 'A historian claims that the French Revolution was driven primarily by economic inequality rather than political ideology. Which quotation from the passage would best support this claim?', choices: ['A) "The revolutionaries adopted the slogan \'Liberty, Equality, Fraternity.\'"', 'B) "While the urban poor struggled to afford bread, the aristocracy hosted lavish banquets that could cost more than a laborer\'s annual wages."', 'C) "The revolution began in 1789."', 'D) "Voltaire and Rousseau influenced Enlightenment thought."'], correct: 1, explanation: 'The stark contrast between the poor\'s struggles and the aristocracy\'s excess directly illustrates economic inequality as a driving force.' },
    { stem: 'An ecologist argues that invasive species are the primary cause of biodiversity loss on Pacific islands. Which piece of evidence would most effectively support this argument?', choices: ['A) Pacific islands have warm climates.', 'B) On islands where rats were introduced by European ships, 85% of native ground-nesting birds have gone extinct, compared to only 5% on rat-free islands.', 'C) Some islands have volcanic origins.', 'D) Tourism has increased on Pacific islands.'], correct: 1, explanation: 'The stark contrast in extinction rates between rat-infested and rat-free islands directly links the invasive species (rats) to biodiversity loss.' },
    { stem: 'A student claims that the passage\'s author believes traditional farming methods are superior to industrial agriculture. Which quotation would best support this claim?', choices: ['A) "Crop yields have increased dramatically since 1950."', 'B) "Traditional polyculture systems maintained soil health for centuries without chemical inputs, while industrial monoculture has depleted topsoil at an alarming rate."', 'C) "Farming employs millions of people worldwide."', 'D) "The tractor replaced the horse in the early 20th century."'], correct: 1, explanation: 'The quotation directly contrasts traditional farming (maintained soil health) with industrial farming (depleted topsoil), clearly favoring traditional methods.' },
    { stem: 'A journalist claims that the city\'s public transit system has improved significantly. Which data from the article would best support this claim?', choices: ['A) The city\'s population grew by 12% last decade.', 'B) Average commute times on public transit decreased by 18 minutes between 2018 and 2024, and ridership increased by 40%.', 'C) The city hired a new transit director in 2020.', 'D) Gasoline prices have risen steadily.'], correct: 1, explanation: 'Shorter commute times and increased ridership are direct, measurable indicators of transit system improvement.' },
    { stem: 'A political scientist argues that voter turnout in local elections is declining because citizens feel disconnected from local government. Which quotation from the passage best supports this claim?', choices: ['A) "Local elections typically occur on different days than national elections."', 'B) "In surveys, 67% of residents said they could not name their city council representative, and 78% said they felt local government had no impact on their daily lives."', 'C) "Voter registration has moved online in many states."', 'D) "Campaign spending in local elections has increased.'], correct: 1, explanation: 'Survey data showing citizens cannot name representatives and feel government has no impact directly demonstrates the disconnection the political scientist describes.' },
    { stem: 'A psychologist argues that childhood exposure to nature improves cognitive development. Which finding would best support this argument?', choices: ['A) Children prefer playing outdoors to indoors.', 'B) Children who spent at least 3 hours per week in natural settings scored significantly higher on attention and problem-solving tests than peers with minimal nature exposure.', 'C) Parks are available in most neighborhoods.', 'D) Some children have allergies to pollen.'], correct: 1, explanation: 'A direct comparison showing better cognitive test scores for children with nature exposure provides the strongest evidence for the causal claim.' },
    { stem: 'An art historian claims that the Impressionists were influenced more by advances in paint technology than by philosophical ideas. Which piece of evidence would best support this claim?', choices: ['A) "The Impressionists exhibited together beginning in 1874."', 'B) "The invention of portable paint tubes in the 1840s freed artists from the studio and enabled the spontaneous outdoor painting that became the movement\'s defining characteristic."', 'C) "Monet and Renoir were close friends."', 'D) "The term Impressionism was coined by a critic."'], correct: 1, explanation: 'This quotation directly links a technological innovation (portable paint tubes) to the movement\'s defining practice (outdoor painting), supporting the claim about technology\'s influence.' },
    { stem: 'A medical researcher argues that handwashing is the single most effective measure for preventing the spread of infectious disease. Which finding would best support this claim?', choices: ['A) Hospitals are expensive to operate.', 'B) A meta-analysis of 30 studies found that regular handwashing reduced the transmission of respiratory and gastrointestinal infections by an average of 40%, outperforming other preventive measures including mask-wearing alone.', 'C) Hand sanitizer was invented in the 20th century.', 'D) Many people do not wash their hands regularly.'], correct: 1, explanation: 'A meta-analysis showing 40% infection reduction and explicit comparison to other measures directly supports the claim that handwashing is the single most effective preventive measure.' },
    { stem: 'A student claims that the passage\'s author is optimistic about the future of renewable energy. Which quotation would best support this claim?', choices: ['A) "Renewable energy currently accounts for about 20% of global electricity."', 'B) "With costs falling by 90% in the past decade and adoption rates accelerating worldwide, renewable energy appears poised to surpass fossil fuels within a generation."', 'C) "Some countries have invested more in renewables than others."', 'D) "Solar panels require regular maintenance."'], correct: 1, explanation: 'The language of falling costs, accelerating adoption, and being "poised to surpass" fossil fuels conveys clear optimism about renewables\' trajectory.' },
    { stem: 'A biologist claims that coral bleaching is primarily caused by rising ocean temperatures. Which piece of evidence from the passage would best support this claim?', choices: ['A) "Coral reefs are found in tropical waters around the world."', 'B) "Data from 50 reef sites showed that bleaching events occurred when water temperatures exceeded 1.5 degrees Celsius above the seasonal average for four or more consecutive weeks."', 'C) "Coral reefs support approximately 25% of marine species."', 'D) "Some coral species can live for hundreds of years."'], correct: 1, explanation: 'Direct data linking temperature thresholds to bleaching events provides the strongest evidence for a causal relationship between rising temperatures and coral bleaching.' },
    { stem: 'A student claims that the passage portrays ancient Rome as both innovative and brutal. Which quotation best supports this claim?', choices: ['A) "Rome was founded, according to tradition, in 753 BCE."', 'B) "The Romans engineered aqueducts that delivered fresh water across vast distances, yet the same empire maintained an economy built substantially on enslaved labor."', 'C) "Latin was the language of the Roman Empire."', 'D) "The Colosseum could seat approximately 50,000 spectators."'], correct: 1, explanation: 'The quotation presents both innovation (aqueducts, engineering) and brutality (enslaved labor) in a single sentence, directly supporting the "both innovative and brutal" characterization.' },
  ],

  /* ── 3.3  Command of Evidence: Graphs ── */
  '3.3': [
    { stem: 'A bar graph shows average test scores for four schools: School A (78), School B (82), School C (85), School D (71). A researcher claims that most schools in the study performed above the district average of 80.\n\nDoes the graph support this claim?', choices: ['A) Yes, because all four schools scored above 80.', 'B) Yes, because two of the four schools (B and C) scored above 80.', 'C) No, because only two of the four schools scored above 80, which is half, not most.', 'D) No, because none of the schools scored above 80.'], correct: 2, explanation: 'Two out of four is 50%, not "most." The claim that most schools scored above 80 is not supported because only half did.' },
    { stem: 'A line graph shows that a city\'s population grew steadily from 2000 to 2015, then leveled off from 2015 to 2020. Which statement is best supported by the graph?', choices: ['A) The city\'s population declined after 2015.', 'B) The city experienced steady growth followed by a period of stabilization.', 'C) The city\'s population doubled between 2000 and 2020.', 'D) The graph shows no clear trend.'], correct: 1, explanation: 'Growth followed by leveling off is correctly described as "steady growth followed by a period of stabilization."' },
    { stem: 'A scatter plot shows a negative correlation between hours of screen time and hours of sleep for teenagers. Which conclusion is best supported?', choices: ['A) Screen time causes sleep loss.', 'B) As screen time increases, sleep time tends to decrease.', 'C) Teenagers who sleep more use more screens.', 'D) There is no relationship between screen time and sleep.'], correct: 1, explanation: 'A negative correlation means as one variable increases, the other tends to decrease. Correlation does not prove causation, so B is better than A.' },
    { stem: 'A pie chart shows the energy sources for a country: Coal 35%, Natural Gas 25%, Nuclear 20%, Renewables 15%, Oil 5%. A researcher claims that renewables provide more energy than oil and nuclear combined.\n\nDoes the graph support this claim?', choices: ['A) Yes, because 15% is greater than 25%.', 'B) No, because oil (5%) plus nuclear (20%) equals 25%, which exceeds renewables (15%).', 'C) Yes, because renewables are growing fastest.', 'D) No, because coal provides the most energy.'], correct: 1, explanation: 'Oil (5%) + Nuclear (20%) = 25%, which is greater than Renewables (15%). The claim is not supported by the data.' },
    { stem: 'A double bar graph compares average reading scores for students in 2015 and 2023 across four grade levels. Grades 3 and 5 show increases, while grades 7 and 9 show decreases. Which statement is best supported?', choices: ['A) Reading scores improved at all grade levels.', 'B) The trend in scores varied by grade level, with younger students improving and older students declining.', 'C) The data show no meaningful pattern.', 'D) Scores decreased at all grade levels.'], correct: 1, explanation: 'The data show a split: lower grades improved while upper grades declined. This is best described as a trend that varies by grade level.' },
    { stem: 'A table shows the average daily water usage per person in four countries: Country A (300 liters), Country B (150 liters), Country C (80 liters), Country D (45 liters). A researcher claims that wealthier countries use more water per person.\n\nWhich additional information would be needed to evaluate this claim?', choices: ['A) The population of each country', 'B) The GDP per capita of each country', 'C) The total area of each country', 'D) The type of water treatment used'], correct: 1, explanation: 'To evaluate whether wealthier countries use more water, you need economic data (GDP per capita) to compare with the water usage figures. The table alone shows usage but not wealth.' },
    { stem: 'A histogram shows the distribution of test scores for 100 students. The bars are tallest around 70-80 and drop off sharply below 50 and above 95. The distribution is best described as:', choices: ['A) uniform', 'B) approximately normal, centered around the 70-80 range', 'C) bimodal', 'D) skewed heavily to the right'], correct: 1, explanation: 'A distribution that peaks in the middle range and drops off on both sides is approximately normal (bell-shaped), centered around the 70-80 range.' },
    { stem: 'A line graph shows the number of electric vehicles sold in a country from 2015 to 2023. Sales increase slowly from 2015 to 2018, then rise steeply from 2019 to 2023. Which statement is best supported?', choices: ['A) Electric vehicle sales have been constant over time.', 'B) The rate of growth in electric vehicle sales accelerated significantly after 2018.', 'C) Electric vehicle sales peaked in 2018 and then declined.', 'D) The graph shows no trend.'], correct: 1, explanation: 'Slow growth followed by steep growth indicates acceleration. The rate of increase grew larger after 2018.' },
    { stem: 'A stacked bar graph shows the sources of electricity generation for a state: coal (declining from 60% to 20%), natural gas (steady at 25%), and renewables (growing from 15% to 55%) over a 10-year period. Which conclusion is best supported?', choices: ['A) Total electricity generation decreased.', 'B) The state shifted its electricity generation from coal to renewable sources.', 'C) Natural gas became the dominant source.', 'D) Coal usage increased over the period.'], correct: 1, explanation: 'Coal declined from 60% to 20% while renewables grew from 15% to 55%, indicating a clear shift from coal to renewables.' },
    { stem: 'A scatter plot shows the relationship between hours of sleep and GPA for 50 college students. The points form a loose positive cluster with several outliers. Which statement is most appropriate?', choices: ['A) More sleep causes a higher GPA.', 'B) There appears to be a weak positive association between sleep and GPA, though outliers suggest other factors are also important.', 'C) The data prove that sleep is the most important factor in academic success.', 'D) There is no relationship between sleep and GPA.'], correct: 1, explanation: 'A loose positive cluster suggests a weak positive association, not a strong causal relationship. Outliers indicate that other factors also influence GPA. Scatter plots show association, not causation.' },
    { stem: 'A table shows four cities\' average January temperatures: City A (28 F), City B (45 F), City C (62 F), City D (73 F). A researcher claims that cities farther south have warmer January temperatures. Which additional data would most help evaluate this claim?', choices: ['A) The population of each city', 'B) The latitude of each city', 'C) The July temperatures for each city', 'D) The elevation of each city'], correct: 1, explanation: 'To evaluate whether being "farther south" correlates with warmer temperatures, you need latitude data for each city.' },
    { stem: 'A pie chart shows the breakdown of a household budget: Housing 35%, Food 20%, Transportation 15%, Savings 10%, Entertainment 10%, Other 10%. The household income is $5,000 per month. How much is spent on transportation?', choices: ['A) $500', 'B) $750', 'C) $1,000', 'D) $1,750'], correct: 1, explanation: '15% of $5,000 = 0.15 * 5000 = $750.' },
    { stem: 'A bar graph shows voter turnout for five elections: 2004 (55%), 2008 (62%), 2012 (58%), 2016 (56%), 2020 (67%). Which statement is best supported by the data?', choices: ['A) Voter turnout has steadily increased over time.', 'B) Voter turnout fluctuated between elections, with the highest turnout in 2020.', 'C) Voter turnout decreased after 2008.', 'D) Fewer than half of eligible voters participated in every election.'], correct: 1, explanation: 'The data shows ups and downs (55, 62, 58, 56, 67) rather than a steady trend. The highest value is 67% in 2020.' },
    { stem: 'A table shows the average hours of sleep for students by age group: Age 10-12 (9.2 hours), Age 13-15 (7.8 hours), Age 16-18 (6.9 hours), Age 19-22 (6.5 hours). Which statement is best supported?', choices: ['A) Sleep duration increases with age.', 'B) There is a consistent decline in average sleep as age increases.', 'C) Teenagers get more sleep than children.', 'D) All age groups meet recommended sleep guidelines.'], correct: 1, explanation: 'The data shows a clear pattern: average sleep decreases at each age group (9.2, 7.8, 6.9, 6.5), supporting a consistent decline with increasing age.' },
    { stem: 'A line graph shows Company A\'s revenue increasing steadily from $1M to $5M over five years, while Company B\'s revenue increases from $3M to $4M over the same period. Which conclusion is best supported?', choices: ['A) Company A is more profitable than Company B.', 'B) Company A grew at a faster rate than Company B, though Company B started with higher revenue.', 'C) Company B will eventually go out of business.', 'D) Both companies grew at the same rate.'], correct: 1, explanation: 'Company A grew by $4M (400%) while Company B grew by $1M (33%). A grew faster, but B started higher. Revenue does not necessarily indicate profitability.' },
  ],

  /* ── 3.4  Inferences & Extreme Language ── */
  '3.4': [
    { stem: 'A passage states: "While the new irrigation system improved crop yields in most regions, areas with sandy soil showed little to no improvement."\n\nWhich inference is best supported by the passage?', choices: ['A) The irrigation system is completely ineffective.', 'B) Soil type may influence how well the irrigation system works.', 'C) Sandy soil is found in most regions.', 'D) The irrigation system should be discontinued everywhere.'], correct: 1, explanation: 'The passage notes that results varied by soil type, supporting the inference that soil composition affects the system\'s effectiveness. Answers with extreme language ("completely," "everywhere") go beyond what the text says.' },
    { stem: 'An economist writes that a new trade agreement "is likely to benefit large exporters but may place smaller domestic producers at a competitive disadvantage."\n\nBased on the passage, which statement would the economist most likely agree with?', choices: ['A) The agreement will definitely harm all businesses.', 'B) The agreement\'s effects will vary depending on the size and type of business.', 'C) Small businesses will always fail under free trade.', 'D) The agreement has no economic significance.'], correct: 1, explanation: 'The economist distinguishes between large exporters (benefit) and small producers (disadvantage), indicating effects vary by business type. Words like "always" and "definitely" are too extreme.' },
    { stem: 'A passage describes an artist who "drew inspiration from both classical European traditions and West African textile patterns, creating a style that belonged wholly to neither tradition."\n\nIt can most reasonably be inferred that the artist\'s style:', choices: ['A) rejected all artistic traditions', 'B) was a unique synthesis of multiple cultural influences', 'C) was identical to classical European painting', 'D) was identical to West African textile design'], correct: 1, explanation: 'Drawing from two traditions while "belonging wholly to neither" indicates a new, synthesized style rather than a copy of either source.' },
    { stem: 'A passage states: "The vaccine reduced hospitalizations in the study population by 60%, though researchers cautioned that more trials with diverse age groups are needed."\n\nWhich inference is best supported?', choices: ['A) The vaccine is completely ineffective.', 'B) The researchers believe their initial results are promising but not yet generalizable.', 'C) The vaccine works equally well for all age groups.', 'D) No further testing is necessary.'], correct: 1, explanation: 'A 60% reduction is positive ("promising"), but the call for "more trials with diverse age groups" indicates the researchers are cautious about broad claims ("not yet generalizable").' },
    { stem: 'A historian writes that a medieval king "tolerated dissent among his advisors, though he never relinquished the final word on matters of state."\n\nBased on this statement, the king can best be described as:', choices: ['A) a purely democratic ruler', 'B) open to counsel but ultimately authoritative', 'C) completely indifferent to his advisors\' opinions', 'D) a weak leader easily swayed by others'], correct: 1, explanation: '"Tolerated dissent" shows openness; "never relinquished the final word" shows he retained authority. This combination is best described as open to counsel but ultimately authoritative.' },
    { stem: 'A passage states: "The artist\'s early works were derivative and conventional, showing clear influences from the Dutch masters, but her later paintings developed an unmistakable personal vision."\n\nWhich inference is best supported?', choices: ['A) The Dutch masters were not talented.', 'B) The artist\'s style evolved significantly over the course of her career.', 'C) The artist\'s later paintings were inferior to her early works.', 'D) All artists are influenced by the Dutch masters.'], correct: 1, explanation: 'The progression from "derivative and conventional" to "unmistakable personal vision" directly supports the inference that her style evolved significantly.' },
    { stem: 'An article states: "Although the supplement showed promising results in laboratory mice, the researchers emphasized that animal studies frequently fail to replicate in human trials."\n\nWhich inference is best supported?', choices: ['A) The supplement will definitely work in humans.', 'B) The researchers are cautiously optimistic but recognize the findings may not apply to humans.', 'C) Animal testing is always unreliable.', 'D) The researchers plan to discontinue the study.'], correct: 1, explanation: '"Promising results" shows optimism, while "frequently fail to replicate" shows caution about applicability. The researchers are hopeful but aware of limitations.' },
    { stem: 'A passage states: "The company\'s profits rose steadily for five years under the previous CEO, but the board nevertheless voted to replace her, citing a need for \'fresh strategic direction.\'"\n\nIt can most reasonably be inferred that:', choices: ['A) the CEO was incompetent', 'B) the board valued future strategic vision over current financial performance', 'C) the company was losing money', 'D) all board members opposed the CEO personally'], correct: 1, explanation: 'The CEO delivered profits, yet the board replaced her for strategic reasons. This implies the board prioritized future direction over present financial success.' },
    { stem: 'A study finds that students who took notes by hand performed better on conceptual questions than students who typed notes on laptops, even though the laptop users recorded more total words.\n\nWhich inference is best supported?', choices: ['A) Laptops should be banned from all classrooms.', 'B) The physical act of handwriting may engage deeper cognitive processing than transcription-style typing.', 'C) Students who type are less intelligent than those who write by hand.', 'D) The amount of notes taken is the most important factor in learning.'], correct: 1, explanation: 'Since laptop users wrote more words but performed worse on conceptual questions, the advantage is not about quantity. The inference is that handwriting engages deeper processing than verbatim typing.' },
    { stem: 'A passage describes a city that invested heavily in bicycle infrastructure and saw a 60% increase in cycling, a 15% decrease in traffic congestion, and a measurable improvement in air quality.\n\nWhich inference is best supported?', choices: ['A) All cities should build bicycle lanes immediately.', 'B) Investment in cycling infrastructure can produce multiple interconnected benefits for urban areas.', 'C) Cars will be completely replaced by bicycles within a decade.', 'D) The city had no traffic before the bicycle lanes were built.'], correct: 1, explanation: 'The passage shows multiple positive outcomes from one investment, supporting the inference that cycling infrastructure produces interconnected benefits. The extreme claims in A and C go beyond what the text supports.' },
    { stem: 'An author writes: "The museum\'s decision to charge free admission on Sundays doubled weekend attendance, but it also strained the building\'s aging infrastructure and led to longer wait times that frustrated some longtime patrons."\n\nBased on this statement, the free admission policy can best be described as:', choices: ['A) an unqualified success', 'B) a complete failure', 'C) a policy with significant benefits and notable drawbacks', 'D) irrelevant to the museum\'s mission'], correct: 2, explanation: 'The passage presents both a clear benefit (doubled attendance) and clear drawbacks (strained infrastructure, frustrated patrons), making C the most accurate characterization.' },
    { stem: 'A passage states: "The new highway reduced commute times by 25% for suburban residents, but it also bisected a historically Black neighborhood, displacing hundreds of families."\n\nWhich inference is best supported?', choices: ['A) All highways are harmful.', 'B) Infrastructure projects can create benefits for some groups while imposing significant costs on others.', 'C) Suburban residents do not care about urban neighborhoods.', 'D) Commute times are the only important factor in transportation planning.'], correct: 1, explanation: 'The passage shows one group benefiting (suburban commuters) while another bears the cost (displaced families), supporting the inference about unequal distribution of impacts.' },
    { stem: 'An article notes that a country\'s GDP per capita has doubled over the past decade, while its happiness index has remained unchanged.\n\nWhich inference is best supported?', choices: ['A) The country\'s economy is failing.', 'B) Economic growth alone may not be sufficient to increase overall well-being.', 'C) GDP is a meaningless statistic.', 'D) Happiness surveys are always inaccurate.'], correct: 1, explanation: 'If wealth doubled but happiness stayed the same, the most reasonable inference is that economic growth alone does not guarantee improved well-being.' },
    { stem: 'A passage describes a school that replaced traditional letter grades with narrative assessments and saw a significant increase in student engagement but a decrease in college acceptance rates.\n\nBased on the passage, the school\'s grading change:', choices: ['A) was entirely beneficial', 'B) was entirely harmful', 'C) had mixed results, improving one outcome while worsening another', 'D) had no measurable effect'], correct: 2, explanation: 'Increased engagement (positive) combined with decreased college acceptance rates (negative) represents mixed results.' },
    { stem: 'A researcher writes: "The coral reefs in this region appear healthy based on visual surveys, but chemical analysis reveals dangerously elevated levels of nitrogen and phosphorus in the surrounding waters."\n\nThe most reasonable inference is that:', choices: ['A) the coral reefs are in no danger', 'B) visual surveys may not capture all threats to reef health, and chemical testing reveals risks not yet visible', 'C) chemical analysis is always wrong', 'D) the nitrogen levels are beneficial to coral'], correct: 1, explanation: 'The contrast between healthy appearance and dangerous chemical levels implies that visual surveys alone may miss hidden threats, and that the reefs face risks not yet visible.' },
    { stem: 'A study finds that students who eat breakfast daily perform better academically than students who skip breakfast, even after controlling for income level.\n\nWhich inference is best supported?', choices: ['A) Breakfast is the only factor that affects academic performance.', 'B) Breakfast may independently contribute to academic performance regardless of socioeconomic status.', 'C) All students who skip breakfast will fail.', 'D) Income has no effect on academic performance.'], correct: 1, explanation: 'Controlling for income means the difference persists regardless of wealth, suggesting breakfast independently contributes. "Only factor" and "all students" are too extreme.' },
    { stem: 'A passage notes that while many ancient civilizations independently developed agriculture, they domesticated different crops depending on their local environments: wheat in the Fertile Crescent, rice in East Asia, and maize in Mesoamerica.\n\nWhich inference is best supported?', choices: ['A) Agriculture was invented only once and then spread worldwide.', 'B) The specific crops domesticated were shaped by local ecological conditions, though the impulse to farm emerged in multiple places.', 'C) Wheat is more nutritious than rice or maize.', 'D) Ancient civilizations had no contact with each other.'], correct: 1, explanation: 'Independent development in multiple regions with different crops suggests farming was a convergent development shaped by local ecology, not a single invention that spread.' },
  ],

  /* ── 4.1  Sentence Boundaries ── */
  '4.1': [
    { stem: 'The research team collected samples from the riverbed, _______ they analyzed the samples at the university laboratory over the following week.', choices: ['A) NO CHANGE', 'B) riverbed, and', 'C) riverbed and,', 'D) riverbed and:'], correct: 1, explanation: 'Two independent clauses joined by only a comma create a comma splice. Adding "and" after the comma correctly joins the clauses with a comma + coordinating conjunction.' },
    { stem: 'The museum\'s new exhibit features artifacts from ancient Egypt. _______ including jewelry, pottery, and stone carvings.', choices: ['A) NO CHANGE', 'B) Egypt, including', 'C) Egypt; including', 'D) Egypt: Including'], correct: 1, explanation: '"Including jewelry, pottery, and stone carvings" is a fragment, not a complete sentence. Joining it to the previous sentence with a comma eliminates the fragment.' },
    { stem: 'The violinist practiced for hours every day _______ she wanted to be ready for the national competition.', choices: ['A) day she', 'B) day, she', 'C) day; she', 'D) day she,'], correct: 2, explanation: 'Both clauses are independent. A semicolon correctly separates two complete, related thoughts. A comma alone (B) would create a comma splice, and no punctuation (A) creates a run-on.' },
    { stem: 'Despite the heavy rain, the outdoor concert continued as planned _______ the organizers had rented a large tent earlier that week.', choices: ['A) planned, the organizers', 'B) planned the organizers', 'C) planned. The organizers', 'D) planned; and, the organizers'], correct: 2, explanation: 'Two independent clauses require proper separation. A period creates two clear sentences. Option A is a comma splice.' },
    { stem: 'The committee reviewed all applications _______ then selected three finalists for interviews.', choices: ['A) applications, then', 'B) applications and then', 'C) applications; then,', 'D) applications then,'], correct: 1, explanation: 'The two actions share the same subject ("the committee") and can be joined by "and" without a comma, forming a compound predicate rather than two independent clauses.' },
    { stem: 'Although the evidence was compelling _______ the jury took three days to reach a verdict.', choices: ['A) compelling the', 'B) compelling, the', 'C) compelling. The', 'D) compelling; the'], correct: 1, explanation: '"Although the evidence was compelling" is a dependent clause that must be attached to the main clause with a comma, not separated as an independent sentence.' },
    { stem: 'The volcano had been dormant for centuries _______ geologists were surprised when seismic activity resumed.', choices: ['A) centuries, geologists', 'B) centuries geologists', 'C) centuries, so geologists', 'D) centuries; and so, geologists'], correct: 2, explanation: 'Two independent clauses need proper joining. A comma followed by the coordinating conjunction "so" correctly shows the cause-and-effect relationship.' },
    { stem: 'The temperature dropped below freezing _______ the roads became dangerously icy overnight.', choices: ['A) freezing the', 'B) freezing, the', 'C) freezing, and the', 'D) freezing, and, the'], correct: 2, explanation: 'Two independent clauses should be joined by a comma plus a coordinating conjunction. "And" correctly joins the clauses without creating a comma splice.' },
    { stem: 'Walking along the beach at sunset. Maria found a piece of sea glass shaped like a heart.', choices: ['A) NO CHANGE', 'B) Walking along the beach at sunset, Maria', 'C) Walking along the beach at sunset; Maria', 'D) Walking along the beach at sunset: Maria'], correct: 1, explanation: '"Walking along the beach at sunset" is a participial phrase (fragment) that must be attached to the main clause with a comma.' },
    { stem: 'The professor assigned the essay on Monday _______ the students submitted their drafts on Friday.', choices: ['A) Monday, the', 'B) Monday the', 'C) Monday, and the', 'D) Monday; and, the'], correct: 2, explanation: 'Two independent clauses need proper joining. A comma followed by the coordinating conjunction "and" correctly connects them.' },
    { stem: 'Because the river had flooded its banks _______ several roads in the county were closed to traffic.', choices: ['A) banks several', 'B) banks; several', 'C) banks, several', 'D) banks. Several'], correct: 2, explanation: '"Because the river had flooded its banks" is a dependent clause and must be connected to the main clause with a comma, not separated as an independent sentence.' },
  ],

  /* ── 4.2  Colon & Dash Rules ── */
  '4.2': [
    { stem: 'The study identified three key factors _______ diet, exercise, and sleep quality.', choices: ['A) that included:', 'B) :', 'C) , which are', 'D) --'], correct: 1, explanation: 'A colon correctly introduces a list after a complete independent clause. "The study identified three key factors" can stand alone, so a colon is appropriate.' },
    { stem: 'The Great Wall of China -- originally built to protect against northern invasions _______ stretches over 13,000 miles.', choices: ['A) ,', 'B) --', 'C) ;', 'D) :'], correct: 1, explanation: 'The phrase "originally built to protect against northern invasions" is a non-essential aside set off by dashes. A second dash is needed to close the interruption.' },
    { stem: 'The detective had one lead _______ a partial fingerprint found on the windowsill.', choices: ['A) , and it was', 'B) :', 'C) ; being', 'D) , it was'], correct: 1, explanation: 'A colon correctly introduces the specific detail that explains "one lead." The preceding clause is complete, making the colon appropriate.' },
    { stem: 'The author\'s thesis is straightforward _______ technology changes society faster than laws can adapt.', choices: ['A) straightforward,', 'B) straightforward:', 'C) straightforward;', 'D) straightforward and'], correct: 1, explanation: 'A colon is used after a complete independent clause to introduce an explanation or elaboration. Here it introduces the thesis statement itself.' },
    { stem: 'The orchestra performed three pieces _______ a symphony by Beethoven, a concerto by Mozart, and an overture by Rossini.', choices: ['A) pieces,', 'B) pieces;', 'C) pieces:', 'D) pieces --'], correct: 2, explanation: 'A colon correctly introduces a list that specifies the "three pieces" mentioned in the independent clause.' },
    { stem: 'The discovery -- which had been years in the making _______ earned the scientist international recognition.', choices: ['A) ,', 'B) --', 'C) ;', 'D) :'], correct: 1, explanation: 'A parenthetical phrase set off by dashes must have matching dashes on both sides. The second dash closes the interruption.' },
    { stem: 'The senator had one consistent message for her constituents _______ government must serve the people, not the other way around.', choices: ['A) constituents,', 'B) constituents;', 'C) constituents:', 'D) constituents and'], correct: 2, explanation: 'A colon correctly follows the complete independent clause and introduces the specific content of the "one consistent message."' },
    { stem: 'The chef\'s signature dish -- a slow-braised lamb shoulder seasoned with rosemary and garlic _______ has won numerous culinary awards.', choices: ['A) ,', 'B) --', 'C) :', 'D) ;'], correct: 1, explanation: 'The parenthetical description of the dish is set off by dashes and must be closed with a matching dash before the main clause resumes.' },
    { stem: 'The expedition required three essentials _______ reliable maps, sufficient water, and experienced guides.', choices: ['A) essentials,', 'B) essentials;', 'C) essentials:', 'D) essentials --'], correct: 2, explanation: 'A colon correctly introduces a list that specifies the "three essentials" mentioned in the complete independent clause.' },
    { stem: 'The proposal -- which had been rejected twice before _______ was finally approved by the board in a unanimous vote.', choices: ['A) ,', 'B) --', 'C) ;', 'D) :'], correct: 1, explanation: 'A parenthetical phrase opened by a dash must be closed with a matching dash. The second dash completes the interruption.' },
  ],

  /* ── 4.3  Subject-Verb Agreement ── */
  '4.3': [
    { stem: 'The bouquet of roses _______ delivered to the office every Monday.', choices: ['A) are', 'B) is', 'C) were being', 'D) have been'], correct: 1, explanation: 'The subject is "bouquet" (singular), not "roses." The prepositional phrase "of roses" does not change the subject, so the singular verb "is" is correct.' },
    { stem: 'Neither the coach nor the players _______ satisfied with the referee\'s decision.', choices: ['A) was', 'B) is', 'C) were', 'D) has been'], correct: 2, explanation: 'With "neither...nor," the verb agrees with the nearer subject. "Players" is plural, so "were" is correct.' },
    { stem: 'Each of the volunteers who signed up for the event _______ required to attend a safety briefing.', choices: ['A) are', 'B) were', 'C) is', 'D) have been'], correct: 2, explanation: '"Each" is the subject and is always singular. The intervening phrase "of the volunteers who signed up" does not change the need for a singular verb.' },
    { stem: 'The news about the factory closures _______ alarmed residents throughout the region.', choices: ['A) have', 'B) are', 'C) has', 'D) were'], correct: 2, explanation: '"News" is an uncountable noun that takes a singular verb. "About the factory closures" is a prepositional phrase modifying "news."' },
    { stem: 'The collection of rare stamps that belonged to my grandfather _______ now on display at the local museum.', choices: ['A) are', 'B) is', 'C) were', 'D) have been'], correct: 1, explanation: 'The subject is "collection" (singular), not "stamps." The verb must agree with the singular subject: "is."' },
    { stem: 'Every student and teacher in the building _______ required to participate in the fire drill.', choices: ['A) are', 'B) were', 'C) is', 'D) have been'], correct: 2, explanation: 'When two singular subjects are joined by "and" but preceded by "every," the subject is treated as singular, requiring the singular verb "is."' },
    { stem: 'The jury _______ reached its verdict after two days of deliberation.', choices: ['A) have', 'B) has', 'C) are', 'D) were'], correct: 1, explanation: '"Jury" is a collective noun acting as a single unit. The singular verb "has" agrees with the singular collective subject.' },
    { stem: 'Either the manager or her assistants _______ responsible for locking the office each evening.', choices: ['A) is', 'B) was', 'C) are', 'D) has been'], correct: 2, explanation: 'With "either...or," the verb agrees with the nearer subject. "Assistants" is plural, so "are" is correct.' },
    { stem: 'The number of applicants for the scholarship _______ increased by 40% this year.', choices: ['A) have', 'B) has', 'C) are', 'D) were'], correct: 1, explanation: '"The number of" is a singular expression (referring to one quantity), so it takes the singular verb "has." (Compare: "A number of" would be plural.)' },
    { stem: 'A number of researchers _______ expressed concern about the study\'s methodology.', choices: ['A) has', 'B) have', 'C) is', 'D) was'], correct: 1, explanation: '"A number of" is a plural expression (meaning several), so it takes the plural verb "have." This contrasts with "the number of," which is singular.' },
    { stem: 'The group of hikers, despite their exhaustion, _______ determined to reach the summit before nightfall.', choices: ['A) were', 'B) was', 'C) are', 'D) have been'], correct: 1, explanation: '"Group" is a singular collective noun acting as a unit. "Of hikers" and "despite their exhaustion" are intervening phrases that do not change the singular subject.' },
  ],

  /* ── 4.4  Non-Essential Clauses ── */
  '4.4': [
    { stem: 'Dr. Elena Ruiz _______ who has studied ocean currents for over 20 years _______ recently published her findings in a leading journal.', choices: ['A) , ... ,', 'B) ... ,', 'C) , ...', 'D) (no punctuation needed)'], correct: 0, explanation: '"Who has studied ocean currents for over 20 years" is a non-essential clause (we already know who Dr. Ruiz is from her name). It must be set off by commas on both sides.' },
    { stem: 'The painting _______ was completed in 1889 _______ now hangs in the National Gallery.', choices: ['A) , which ... ,', 'B) that ... ,', 'C) , that ...', 'D) which ...'], correct: 0, explanation: 'The clause "which was completed in 1889" adds extra information and is non-essential. It requires commas on both sides and the relative pronoun "which."' },
    { stem: 'Students _______ have completed the prerequisite course may register for the advanced seminar.', choices: ['A) , who', 'B) who', 'C) , that', 'D) which'], correct: 1, explanation: 'This clause is essential -- it identifies which students may register. Essential clauses use "who" (or "that") without commas.' },
    { stem: 'The Eiffel Tower _______ was completed in 1889 for the World\'s Fair _______ remains Paris\'s most recognizable landmark.', choices: ['A) , which ... ,', 'B) that ... ,', 'C) which ...', 'D) , that ...'], correct: 0, explanation: 'The clause about when the Eiffel Tower was completed is non-essential (we already know which tower), so it requires commas and "which."' },
    { stem: 'The volunteers _______ arrived earliest set up the tables and chairs for the event.', choices: ['A) , who', 'B) who', 'C) , which', 'D) , that'], correct: 1, explanation: 'This clause is essential because it identifies which volunteers (the ones who arrived earliest) set up the tables. Essential clauses use "who" without commas.' },
    { stem: 'Professor Martinez _______ teaches organic chemistry at the university _______ will deliver the keynote address.', choices: ['A) , who ... ,', 'B) who ... ,', 'C) , that ... ,', 'D) who ...'], correct: 0, explanation: '"Who teaches organic chemistry at the university" is non-essential because we already know who Professor Martinez is. It needs commas on both sides and "who."' },
    { stem: 'The students _______ scores fell below the passing threshold will receive additional tutoring.', choices: ['A) whose', 'B) , whose', 'C) who\'s', 'D) which'], correct: 0, explanation: 'This clause is essential (it identifies which students), so no commas are needed. "Whose" correctly shows possession (the students\' scores).' },
    { stem: 'My neighbor\'s dog _______ barks at everything that moves _______ woke me up at 3 a.m.', choices: ['A) , which ... ,', 'B) that ... ,', 'C) , that ...', 'D) which ...'], correct: 0, explanation: 'The clause adds extra information about the dog (non-essential) since "my neighbor\'s dog" already identifies which dog. Use commas with "which."' },
    { stem: 'The architect _______ designed the new city hall _______ also redesigned the public library.', choices: ['A) , who ... ,', 'B) who ...', 'C) , that ... ,', 'D) that ... ,'], correct: 1, explanation: 'This clause is essential -- it identifies which architect. Without it, we do not know which architect is being discussed. Essential clauses use "who" without commas.' },
    { stem: 'Mount Everest _______ is the highest peak in the world _______ attracts thousands of climbers each year.', choices: ['A) , which ... ,', 'B) that ...', 'C) which ... ,', 'D) , that ... ,'], correct: 0, explanation: 'The clause is non-essential because Mount Everest is already specifically identified. Non-essential clauses use "which" with commas on both sides.' },
  ],

  /* ── 4.5  Apostrophes ── */
  '4.5': [
    { stem: 'The two _______ research projects were funded by the same grant.', choices: ['A) scientist\'s', 'B) scientists\'', 'C) scientists', 'D) scientist'], correct: 1, explanation: 'Two scientists share ownership of the projects. The plural possessive "scientists\'" (apostrophe after the s) is correct.' },
    { stem: '_______ important to arrive on time for the exam.', choices: ['A) Its', 'B) It\'s', 'C) Its\'', 'D)Its\'s'], correct: 1, explanation: '"It\'s" is the contraction of "it is." "Its" (no apostrophe) is the possessive form. Here, "It is important" is the intended meaning.' },
    { stem: 'The _______ uniforms were redesigned for the new season.', choices: ['A) team\'s', 'B) teams\'', 'C) teams', 'D) team'], correct: 0, explanation: 'One team owns the uniforms, so the singular possessive "team\'s" is correct.' },
    { stem: 'The _______ decision to merge was announced at the annual shareholder meeting.', choices: ['A) companies\'', 'B) companys\'', 'C) company\'s', 'D) companies'], correct: 0, explanation: 'A merger involves two or more companies. The plural possessive of "company" is "companies\'" (plural form + apostrophe).' },
    { stem: 'The _______ nest was built high in the oak tree.', choices: ['A) bird\'s', 'B) birds', 'C) birds\'', 'D) birds\'s'], correct: 0, explanation: 'One bird built the nest, so the singular possessive "bird\'s" is correct.' },
    { stem: '_______ been raining all morning, so the game was canceled.', choices: ['A) Its', 'B) It\'s', 'C) Its\'', 'D) Itts'], correct: 1, explanation: '"It\'s" is the contraction of "it has." The sentence means "It has been raining all morning."' },
    { stem: 'The three _______ essays were graded over the weekend.', choices: ['A) student\'s', 'B) students\'', 'C) students', 'D) student'], correct: 1, explanation: 'Three students share ownership of the essays. The plural possessive is "students\'" (plural + apostrophe).' },
    { stem: 'The _______ policies have been criticized by environmental groups.', choices: ['A) government\'s', 'B) governments', 'C) governments\'', 'D) government'], correct: 0, explanation: 'One government owns the policies, so the singular possessive "government\'s" is correct.' },
    { stem: 'The _______ decision to move the deadline surprised no one, given how behind they were.', choices: ['A) managers', 'B) managers\'', 'C) manager\'s', 'D) managers\'s'], correct: 1, explanation: 'Multiple managers made the decision jointly, so the plural possessive "managers\'" is correct.' },
    { stem: '_______ a beautiful day outside, so the teacher moved the class to the courtyard.', choices: ['A) Its', 'B) It\'s', 'C) Its\'', 'D) Its\'s'], correct: 1, explanation: '"It\'s" is the contraction of "It is." "Its" (no apostrophe) is the possessive form. Here, "It is a beautiful day" is the intended meaning.' },
  ],

  /* ── 4.6  Dangling Modifiers ── */
  '4.6': [
    { stem: 'Walking through the botanical garden, _______', choices: ['A) the exotic flowers caught Maria\'s attention.', 'B) Maria noticed the exotic flowers.', 'C) attention was drawn to the exotic flowers.', 'D) the attention of Maria was caught by flowers.'], correct: 1, explanation: 'The opening phrase "Walking through the botanical garden" must be followed by the person doing the walking. Only B places Maria as the subject.' },
    { stem: 'After reviewing the data carefully, _______', choices: ['A) the conclusion was reached by the scientists.', 'B) it was concluded that the results were significant.', 'C) the scientists concluded that the results were significant.', 'D) a significant result was concluded.'], correct: 2, explanation: '"After reviewing the data carefully" needs to modify the people who did the reviewing. Only C places "the scientists" as the subject immediately after the modifier.' },
    { stem: 'Exhausted from the long hike, _______', choices: ['A) the tent was set up quickly by the campers.', 'B) setting up the tent was the campers\' priority.', 'C) the campers set up their tent and collapsed.', 'D) a quick tent setup was achieved.'], correct: 2, explanation: 'The modifier "Exhausted from the long hike" must describe a person or people. Only C places "the campers" as the subject.' },
    { stem: 'Hoping to improve her marathon time, _______', choices: ['A) a new training program was adopted.', 'B) the runner hired a professional coach.', 'C) hiring a coach seemed wise.', 'D) the training was intensified.'], correct: 1, explanation: '"Hoping to improve her marathon time" must modify the person doing the hoping. Only B places "the runner" as the subject directly after the modifier.' },
    { stem: 'Having studied for weeks, _______', choices: ['A) the exam seemed easy to the students.', 'B) the students found the exam manageable.', 'C) it was an easy exam.', 'D) the difficulty of the exam was reduced.'], correct: 1, explanation: '"Having studied for weeks" must modify the people who studied. Only B places "the students" as the subject directly after the modifier.' },
    { stem: 'Known for its vibrant nightlife, _______', choices: ['A) tourists flock to the city every summer.', 'B) the city attracts millions of tourists every summer.', 'C) tourism is the city\'s main industry.', 'D) hotel rooms are difficult to find.'], correct: 1, explanation: '"Known for its vibrant nightlife" must modify what is known -- the city. Only B places "the city" as the subject immediately after the modifier.' },
    { stem: 'Frustrated by the delays, _______', choices: ['A) the passengers demanded a refund from the airline.', 'B) a refund was demanded by the passengers.', 'C) the airline was confronted.', 'D) demanding refunds became common.'], correct: 0, explanation: '"Frustrated by the delays" must modify the people who are frustrated. Only A places "the passengers" as the subject directly after the modifier.' },
    { stem: 'Running at full speed, _______', choices: ['A) the finish line was crossed by the sprinter.', 'B) the sprinter crossed the finish line in record time.', 'C) a new record was set.', 'D) the crowd erupted in applause.'], correct: 1, explanation: '"Running at full speed" must modify the person doing the running. Only B places "the sprinter" as the subject after the modifier.' },
    { stem: 'Painted in brilliant shades of orange and purple, _______', choices: ['A) the sunset was captured perfectly by the artist.', 'B) the artist captured the sunset perfectly in her latest canvas.', 'C) the canvas depicted a stunning sunset.', 'D) viewers admired the painting.'], correct: 2, explanation: '"Painted in brilliant shades" describes the canvas (what was painted). Only C places "the canvas" as the subject after the modifier.' },
    { stem: 'Surrounded by towering bookshelves, _______', choices: ['A) the library made the student feel at home.', 'B) a sense of calm washed over the student.', 'C) the student felt immediately at home in the library.', 'D) reading became easier for the student.'], correct: 2, explanation: '"Surrounded by towering bookshelves" must modify the entity that is physically surrounded. Only C places "the student" as the subject directly after the modifier.' },
    { stem: 'Having won three consecutive championships, _______', choices: ['A) the trophy case was overflowing.', 'B) fans celebrated wildly in the streets.', 'C) the team was widely regarded as the best in the league.', 'D) a parade was organized by the city.'], correct: 2, explanation: '"Having won three consecutive championships" must modify whoever did the winning. Only C places "the team" as the subject after the modifier.' },
  ],

  /* ── 5.1  Rhetorical Synthesis ── */
  '5.1': [
    { stem: 'A student is writing a report about the benefits of public libraries and wants to emphasize their role in promoting literacy among children.\n\nWhich choice most effectively uses the relevant information to accomplish this goal?', choices: ['A) Public libraries are buildings that contain books and other materials.', 'B) Many public libraries offer free reading programs for children, helping to build early literacy skills in communities with limited resources.', 'C) Some public libraries have been renovated recently.', 'D) Libraries were invented many centuries ago.'], correct: 1, explanation: 'B directly addresses both the target topic (public libraries) and the specific angle (promoting literacy among children), while the other choices are either too vague or off-topic.' },
    { stem: 'A researcher wants to present a finding about sleep deprivation while acknowledging a limitation of the study.\n\nWhich choice best accomplishes this goal?', choices: ['A) Sleep deprivation reduces cognitive performance.', 'B) The study found that sleep deprivation significantly impairs reaction time, though the sample was limited to college students and may not generalize to all age groups.', 'C) Many people do not get enough sleep.', 'D) Cognitive performance is important for daily tasks.'], correct: 1, explanation: 'B presents the finding (impaired reaction time) and acknowledges the limitation (sample limited to college students), fulfilling both parts of the goal.' },
    { stem: 'A student is writing about renewable energy and wants to contrast solar and wind power in terms of reliability.\n\nWhich choice best accomplishes this goal?', choices: ['A) Solar and wind power are both forms of renewable energy that have grown in popularity.', 'B) While solar panels generate power only during daylight hours, wind turbines can operate day and night, making wind energy more consistently available.', 'C) Renewable energy is better for the environment than fossil fuels.', 'D) Solar panels are made from silicon.'], correct: 1, explanation: 'B directly contrasts solar (daylight only) with wind (day and night) in terms of reliability, which is exactly what the prompt asks for.' },
    { stem: 'A student is writing a report about the Amazon rainforest and wants to emphasize the consequences of deforestation for global climate.\n\nWhich choice most effectively uses relevant information to accomplish this goal?', choices: ['A) The Amazon rainforest is located in South America.', 'B) Because the Amazon absorbs approximately 2 billion tons of carbon dioxide annually, its destruction would release massive quantities of greenhouse gases, accelerating global warming.', 'C) Many species of birds live in the Amazon.', 'D) Brazil is the largest country in South America.'], correct: 1, explanation: 'B directly connects deforestation (the topic) to global climate (the angle) by quantifying the carbon absorption and explaining the consequences of its loss.' },
    { stem: 'A student wants to introduce a counterargument while maintaining a respectful, academic tone.\n\nWhich choice best accomplishes this goal?', choices: ['A) Critics are obviously wrong about this issue.', 'B) Some scholars have raised legitimate concerns about the methodology, arguing that the sample size was insufficient to support such broad conclusions.', 'C) Nobody agrees with the opposing view.', 'D) The other side is completely uninformed.'], correct: 1, explanation: 'B introduces a counterargument ("some scholars have raised legitimate concerns") while maintaining a respectful tone and providing specific reasoning.' },
    { stem: 'A student is writing about the International Space Station and wants to highlight international cooperation.\n\nWhich choice most effectively accomplishes this goal?', choices: ['A) The International Space Station orbits Earth approximately every 90 minutes.', 'B) Built and maintained by a partnership of fifteen nations, the ISS demonstrates that complex scientific endeavors can transcend political boundaries.', 'C) Astronauts eat freeze-dried food aboard the station.', 'D) The station was first launched in 1998.'], correct: 1, explanation: 'B explicitly addresses international cooperation (fifteen nations, transcending political boundaries), which is the stated goal.' },
    { stem: 'A student wants to write a topic sentence that previews the three main points of her essay about ocean pollution.\n\nWhich choice best accomplishes this goal?', choices: ['A) Ocean pollution is a problem.', 'B) Ocean pollution threatens marine ecosystems, endangers human health through contaminated seafood, and costs coastal economies billions in lost tourism revenue.', 'C) Many people enjoy visiting the beach.', 'D) Scientists have studied ocean pollution for decades.'], correct: 1, explanation: 'B previews three specific main points (ecosystems, human health, coastal economies) that the essay will develop, functioning as an effective road-map topic sentence.' },
    { stem: 'A student wants to conclude a paragraph about the decline of pollinator populations by connecting the issue to the reader\'s daily life.\n\nWhich choice best accomplishes this goal?', choices: ['A) Pollinator populations have declined for many reasons.', 'B) Without pollinators, one in every three bites of food on your plate would disappear, from the apple in your lunch to the coffee in your morning cup.', 'C) Bees are a type of pollinator.', 'D) Researchers are studying pollinator decline.'], correct: 1, explanation: 'B connects pollinator decline directly to the reader\'s personal experience (food on your plate, your morning coffee), making the abstract issue concrete and personally relevant.' },
    { stem: 'A student is writing about the water crisis in developing nations and wants to propose a solution while acknowledging its limitations.\n\nWhich choice best accomplishes this goal?', choices: ['A) Many people in developing nations lack access to clean water.', 'B) Desalination technology could provide clean water to coastal communities, though its high energy requirements and cost currently limit widespread adoption in low-income regions.', 'C) Water is essential for human survival.', 'D) Some countries have more water than others.'], correct: 1, explanation: 'B proposes a solution (desalination) while acknowledging limitations (high energy, cost, limited adoption), fulfilling both parts of the writing goal.' },
    { stem: 'A student is writing about immigration and wants to support a claim with a specific historical example.\n\nWhich choice most effectively accomplishes this goal?', choices: ['A) Immigration has always been a part of American history.', 'B) The wave of Irish immigrants who arrived during the Great Famine of the 1840s transformed cities like Boston and New York, establishing communities that shaped American culture for generations.', 'C) People move to new countries for many reasons.', 'D) Immigration policy is complicated.'], correct: 1, explanation: 'B provides a specific historical example (Irish immigrants, 1840s Great Famine) with concrete details (Boston, New York) and effects (shaped culture), effectively supporting a claim with evidence.' },
  ],

  /* ── 5.2  Transitions ── */
  '5.2': [
    { stem: 'The city council approved funding for the new park. _______, construction is expected to begin in the spring.', choices: ['A) Nevertheless', 'B) Accordingly', 'C) In contrast', 'D) For example'], correct: 1, explanation: 'The construction follows logically from the approval of funding. "Accordingly" signals a logical consequence.' },
    { stem: 'The initial experiments yielded promising results. _______, the team discovered a significant flaw in their methodology that cast doubt on the findings.', choices: ['A) Furthermore', 'B) Similarly', 'C) However', 'D) Therefore'], correct: 2, explanation: 'The second sentence contradicts the positive tone of the first. "However" correctly signals this contrast.' },
    { stem: 'The company increased its marketing budget by 40%. _______, it hired a new team of social media specialists.', choices: ['A) In contrast', 'B) Nevertheless', 'C) Additionally', 'D) However'], correct: 2, explanation: 'Hiring specialists is an additional action in the same direction as increasing the marketing budget. "Additionally" signals that both actions support the same goal.' },
    { stem: 'The novelist spent years researching 18th-century shipbuilding techniques. This dedication to historical accuracy is evident throughout the book; _______, the descriptions of the ship\'s construction are so detailed that maritime historians have praised their precision.', choices: ['A) in contrast', 'B) for instance', 'C) nevertheless', 'D) as a result'], correct: 1, explanation: 'The sentence about detailed ship descriptions serves as a specific example of the dedication to accuracy mentioned earlier. "For instance" introduces an example.' },
    { stem: 'The restaurant received a health code violation in March. _______, the owners hired a professional cleaning service and retrained all staff on food safety protocols.', choices: ['A) Similarly', 'B) In response', 'C) Meanwhile', 'D) In contrast'], correct: 1, explanation: 'The owners\' actions were a direct response to the violation. "In response" signals that the second event was prompted by the first.' },
    { stem: 'The drought reduced crop yields across the region by 30%. _______, many farmers were forced to seek alternative sources of income.', choices: ['A) Nevertheless', 'B) For example', 'C) As a result', 'D) In contrast'], correct: 2, explanation: 'Farmers seeking alternative income is a consequence of reduced crop yields. "As a result" correctly shows cause and effect.' },
    { stem: 'The first attempt to summit the mountain ended in failure. _______, the climbers were better prepared and reached the peak on their second attempt three months later.', choices: ['A) Similarly', 'B) In other words', 'C) This time', 'D) For example'], correct: 2, explanation: '"This time" signals a temporal shift and contrast between the first failed attempt and the subsequent successful one.' },
    { stem: 'The painting\'s colors appear muted in photographs. _______, viewing the original in person reveals vibrant hues that no reproduction can capture.', choices: ['A) Furthermore', 'B) Similarly', 'C) By contrast', 'D) Therefore'], correct: 2, explanation: 'The sentence contrasts how the painting looks in photos (muted) versus in person (vibrant). "By contrast" signals this difference.' },
    { stem: 'The school district implemented a new reading program in September. _______, test scores in reading comprehension improved by 12% by the end of the academic year.', choices: ['A) In contrast', 'B) Nevertheless', 'C) Subsequently', 'D) On the other hand'], correct: 2, explanation: 'The improvement came after the program was implemented. "Subsequently" indicates that the second event followed the first in time.' },
    { stem: 'Exercise has well-documented physical health benefits. _______, research increasingly shows that regular physical activity can reduce symptoms of anxiety and depression.', choices: ['A) However', 'B) Moreover', 'C) Instead', 'D) In contrast'], correct: 1, explanation: 'Mental health benefits are an additional point that extends the discussion beyond physical health. "Moreover" introduces supplementary supporting information.' },
    { stem: 'The team had been trailing by 20 points at halftime. _______, they mounted a remarkable comeback in the second half to win by 5.', choices: ['A) Furthermore', 'B) Similarly', 'C) Nonetheless', 'D) Therefore'], correct: 2, explanation: 'Winning despite trailing by 20 points is an unexpected outcome. "Nonetheless" signals that the result happened despite the unfavorable circumstances.' },
    { stem: 'Early astronomers believed Earth was the center of the universe. _______, Copernicus proposed that the planets, including Earth, revolve around the Sun.', choices: ['A) In addition', 'B) In contrast', 'C) Similarly', 'D) Furthermore'], correct: 1, explanation: 'The geocentric model and the heliocentric model are opposing views. "In contrast" signals the shift from one position to its opposite.' },
    { stem: 'The new policy increased access to healthcare for millions of previously uninsured citizens. _______, it also raised concerns about increased costs for taxpayers.', choices: ['A) Therefore', 'B) Similarly', 'C) At the same time', 'D) For example'], correct: 2, explanation: 'The sentence presents a benefit alongside a concern. "At the same time" signals two coexisting but contrasting aspects of the same policy.' },
  ],

  /* ── 5.3  Concision ── */
  '5.3': [
    { stem: 'Which choice most concisely expresses the idea without changing the meaning?\n\n"In the modern world of today, many people who are alive now communicate using digital technology."', choices: ['A) NO CHANGE', 'B) In today\'s world, many people communicate digitally.', 'C) Currently, in the present day, many living people communicate using technology that is digital.', 'D) People who are alive in the modern world today communicate via digital means of technology.'], correct: 1, explanation: '"In the modern world of today" and "people who are alive now" are redundant. B eliminates the redundancy while preserving the meaning.' },
    { stem: 'The committee members were in agreement with one another and decided unanimously to approve the proposal.\n\nWhich revision eliminates the redundancy?', choices: ['A) NO CHANGE', 'B) The committee members agreed with one another unanimously and decided to approve the proposal.', 'C) The committee unanimously approved the proposal.', 'D) The committee members, in agreement, decided unanimously together to approve the proposal.'], correct: 2, explanation: '"In agreement with one another" and "decided unanimously" say the same thing. C keeps "unanimously approved" and cuts the redundancy.' },
    { stem: 'Due to the fact that the bridge was closed, commuters had to find alternative routes.\n\nWhich revision is most concise?', choices: ['A) NO CHANGE', 'B) Because the bridge was closed, commuters had to find alternative routes.', 'C) Owing to the fact that the bridge closure had occurred, commuters had to find routes that were alternative.', 'D) Given the fact that the bridge was closed down, commuters had to find other alternative routes.'], correct: 1, explanation: '"Due to the fact that" is a wordy way to say "because." B is the most direct and concise version.' },
    { stem: 'At the present time, the company is currently in the process of developing a new product.\n\nWhich revision eliminates the redundancy?', choices: ['A) NO CHANGE', 'B) Currently, the company is in the process of developing a new product at this time.', 'C) The company is developing a new product.', 'D) At this point in time, the company is currently developing a new product.'], correct: 2, explanation: '"At the present time," "currently," and "in the process of" are all redundant. C conveys the same meaning in the most concise way.' },
    { stem: 'The speaker made a personal opinion of her own about the proposed policy changes.\n\nWhich revision is most concise?', choices: ['A) NO CHANGE', 'B) The speaker shared her personal opinion of her own.', 'C) The speaker shared her opinion about the proposed policy changes.', 'D) The speaker made an opinion that was personal and her own about the changes to the proposed policy.'], correct: 2, explanation: '"Personal," "of her own," and "opinion" all convey the same idea. C eliminates the redundancy by using simply "her opinion."' },
    { stem: 'The students collaborated together in groups to complete the assignment.\n\nWhich revision eliminates the redundancy?', choices: ['A) NO CHANGE', 'B) The students collaborated together.', 'C) The students collaborated in groups to complete the assignment.', 'D) The students worked in collaborative groups together to complete the assignment.'], correct: 2, explanation: '"Collaborate" already means to work together, so "together" is redundant. C removes the redundancy.' },
    { stem: 'The biography tells the story of the life of a woman who was a pioneer in the field of medicine.\n\nWhich revision is most concise?', choices: ['A) NO CHANGE', 'B) The biography tells the life story of a pioneering woman in medicine.', 'C) The biography chronicles a pioneer in medicine.', 'D) The biography tells the story of the entire life of a woman who pioneered in the medical field.'], correct: 2, explanation: 'A biography by definition tells a life story. C eliminates the redundancy while keeping the essential meaning.' },
    { stem: 'It is absolutely essential that each and every employee attend the mandatory training session.\n\nWhich revision is most concise?', choices: ['A) NO CHANGE', 'B) It is absolutely essential that each employee attend the training session.', 'C) Every employee must attend the training session.', 'D) It is essential and mandatory that each and every employee attend the session that is required.'], correct: 2, explanation: '"Absolutely essential" and "mandatory" are redundant; "each and every" repeats the same idea. C is concise while preserving the meaning.' },
    { stem: 'The firefighters who responded to the emergency situation worked together cooperatively to extinguish the blaze.\n\nWhich revision is most concise?', choices: ['A) NO CHANGE', 'B) The firefighters who responded cooperatively extinguished the blaze.', 'C) The firefighters worked together to extinguish the blaze.', 'D) The responding firefighters cooperatively worked together as a team to extinguish the blaze.'], correct: 2, explanation: '"Emergency situation" is redundant (emergencies are situations). "Worked together cooperatively" is also redundant. C is the most concise version.' },
    { stem: 'The end result of the experiment was that the hypothesis was proven to be true and correct.\n\nWhich revision is most concise?', choices: ['A) NO CHANGE', 'B) The experiment\'s end result proved the hypothesis true and correct.', 'C) The experiment confirmed the hypothesis.', 'D) The result of the experiment, in the end, proved that the hypothesis was indeed true.'], correct: 2, explanation: '"End result" is redundant (all results come at the end), and "true and correct" says the same thing twice. C conveys the meaning most concisely.' },
  ],

  /* ── 6.1  Desmos Regression ── */
  '6.1': [
    { stem: 'A student enters the data points (1, 2), (2, 6), (3, 12), (4, 20) into a graphing calculator and runs a quadratic regression. The resulting equation is approximately y = x^2 + x. According to this model, what is the predicted y-value when x = 6?', choices: ['A) 36', 'B) 42', 'C) 48', 'D) 54'], correct: 1, explanation: 'Substituting x = 6: y = 6^2 + 6 = 36 + 6 = 42.' },
    { stem: 'A scatterplot of data roughly follows an exponential pattern. A student uses Desmos to fit an exponential regression of the form y = a * b^x and gets y = 2(1.5)^x. What is the y-intercept of this model?', choices: ['A) 0', 'B) 1.5', 'C) 2', 'D) 3'], correct: 2, explanation: 'The y-intercept occurs when x = 0. Substituting: y = 2(1.5)^0 = 2(1) = 2.' },
    { stem: 'A student uses linear regression on data and obtains y = 3.2x + 5.8 with r^2 = 0.97. Which statement best interprets the r^2 value?', choices: ['A) The slope of the line is 0.97.', 'B) The model explains approximately 97% of the variation in the data.', 'C) 97% of the data points are exactly on the line.', 'D) The y-intercept is 0.97.'], correct: 1, explanation: 'r^2 represents the proportion of variance in the dependent variable explained by the model. An r^2 of 0.97 means the model accounts for about 97% of the variation.' },
    { stem: 'A student enters five data points into a graphing calculator and tries both a linear and a quadratic regression. The linear model gives r^2 = 0.82 and the quadratic gives r^2 = 0.98. Which model is the better fit for the data?', choices: ['A) The linear model, because it is simpler.', 'B) The quadratic model, because it has a higher r^2 value.', 'C) Neither model fits the data.', 'D) Both models fit equally well.'], correct: 1, explanation: 'A higher r^2 value indicates a better fit. The quadratic model with r^2 = 0.98 explains more of the data\'s variation than the linear model.' },
    { stem: 'A student runs a linear regression on data and obtains y = -1.5x + 20. What does the slope -1.5 indicate about the relationship between x and y?', choices: ['A) y increases by 1.5 for every 1-unit increase in x.', 'B) y decreases by 1.5 for every 1-unit increase in x.', 'C) The y-intercept is -1.5.', 'D) The data has no correlation.'], correct: 1, explanation: 'A negative slope means the relationship is inverse: as x increases by 1, y decreases by 1.5.' },
    { stem: 'A quadratic regression yields y = 0.5x^2 - 3x + 10. What is the minimum value of y according to this model?', choices: ['A) 1.5', 'B) 3', 'C) 5.5', 'D) 10'], correct: 2, explanation: 'The minimum occurs at x = -b/(2a) = 3/(2*0.5) = 3. Substituting: y = 0.5(9) - 3(3) + 10 = 4.5 - 9 + 10 = 5.5.' },
    { stem: 'An exponential regression model gives y = 10(1.2)^x. According to this model, by what percent does y increase for each unit increase in x?', choices: ['A) 10%', 'B) 12%', 'C) 20%', 'D) 120%'], correct: 2, explanation: 'The base 1.2 means the value is multiplied by 1.2 each time x increases by 1. Since 1.2 = 1 + 0.20, this represents a 20% increase per unit.' },
    { stem: 'A scatterplot shows a strong negative linear pattern. A linear regression gives r = -0.95. Which statement is true?', choices: ['A) The data show almost no correlation.', 'B) The data show a strong positive correlation.', 'C) The data show a strong negative correlation.', 'D) The regression line has a positive slope.'], correct: 2, explanation: 'An r value of -0.95 is close to -1, indicating a strong negative linear correlation. The negative sign means as one variable increases, the other decreases.' },
    { stem: 'A regression equation predicts y = 45 when x = 10. The actual observed value at x = 10 is y = 42. What is the residual?', choices: ['A) -3', 'B) 3', 'C) 87', 'D) 45'], correct: 0, explanation: 'Residual = actual - predicted = 42 - 45 = -3. A negative residual means the model overestimated the actual value.' },
    { stem: 'A student fits a logarithmic model y = 10 ln(x) to a data set and gets r^2 = 0.91. A linear model y = 5x + 2 gives r^2 = 0.75. Which statement is correct?', choices: ['A) The linear model is the better fit because it is simpler.', 'B) The logarithmic model is the better fit because it has a higher r^2.', 'C) Both models fit equally well.', 'D) Neither model fits the data.'], correct: 1, explanation: 'A higher r^2 means the model explains more of the variation in the data. The logarithmic model (0.91) fits better than the linear model (0.75).' },
    { stem: 'A linear regression gives y = 2.5x + 10 with r^2 = 0.85. The y-intercept 10 most likely represents:', choices: ['A) the slope of the line', 'B) the predicted value of y when x equals 0', 'C) the number of data points used', 'D) the correlation coefficient'], correct: 1, explanation: 'In a linear equation y = mx + b, the y-intercept b is the predicted value of y when x = 0. Here, when x = 0, y = 10.' },
  ],

  /* ── 6.2  Desmos: Systems & Intersections ── */
  '6.2': [
    { stem: 'The graphs of y = x^2 - 4 and y = 2x - 1 are entered into a graphing calculator. At how many points do the graphs intersect?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) 3'], correct: 2, explanation: 'Setting x^2 - 4 = 2x - 1 gives x^2 - 2x - 3 = 0, which factors as (x - 3)(x + 1) = 0. The solutions x = 3 and x = -1 give two intersection points.' },
    { stem: 'A student graphs y = |x - 2| and y = 3 on a graphing calculator. What are the x-coordinates of the intersection points?', choices: ['A) x = -1 and x = 5', 'B) x = 1 and x = 5', 'C) x = -1 and x = 3', 'D) x = 2 and x = 3'], correct: 0, explanation: 'Setting |x - 2| = 3 gives x - 2 = 3 or x - 2 = -3, so x = 5 or x = -1.' },
    { stem: 'A student graphs y = x + 1 and y = x^2 - 3 on a calculator. How many intersection points are there?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) 3'], correct: 2, explanation: 'Setting x + 1 = x^2 - 3 gives x^2 - x - 4 = 0. The discriminant is 1 + 16 = 17 > 0, so there are two intersection points.' },
    { stem: 'Using a graphing calculator, a student finds that the system y = 3x - 2 and y = 3x + 5 has no intersection points. This means the system has:', choices: ['A) infinitely many solutions', 'B) exactly one solution', 'C) no solution', 'D) exactly two solutions'], correct: 2, explanation: 'The lines have the same slope (3) but different y-intercepts (-2 and 5), so they are parallel and never intersect. The system has no solution.' },
    { stem: 'A student graphs y = x^2 and y = 4 on a calculator. What are the x-coordinates of the intersection points?', choices: ['A) x = 2 only', 'B) x = -2 and x = 2', 'C) x = 4 only', 'D) x = -4 and x = 4'], correct: 1, explanation: 'Setting x^2 = 4 gives x = 2 or x = -2.' },
    { stem: 'A student graphs y = (1/2)x + 3 and y = -(1/2)x + 7 on a calculator. At what point do the lines intersect?', choices: ['A) (4, 5)', 'B) (2, 4)', 'C) (8, 7)', 'D) (4, 3)'], correct: 0, explanation: 'Set (1/2)x + 3 = -(1/2)x + 7. So x = 4, and y = (1/2)(4) + 3 = 5. The intersection is (4, 5).' },
    { stem: 'On a graphing calculator, the graphs of y = 2x + 1 and y = 2x + 1 overlap completely. This means:', choices: ['A) There are no solutions.', 'B) There is exactly one solution.', 'C) There are exactly two solutions.', 'D) There are infinitely many solutions.'], correct: 3, explanation: 'If the graphs overlap completely, every point on one graph is also on the other. The system has infinitely many solutions.' },
    { stem: 'A student uses a graphing calculator to find where y = x^3 - 4x crosses the x-axis. How many x-intercepts does the graph have?', choices: ['A) 1', 'B) 2', 'C) 3', 'D) 4'], correct: 2, explanation: 'Set x^3 - 4x = 0. Factor: x(x^2 - 4) = x(x-2)(x+2) = 0. Solutions: x = 0, x = 2, x = -2. Three x-intercepts.' },
    { stem: 'A student graphs y = |2x - 6| and y = x on a calculator. How many intersection points are there?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) 3'], correct: 2, explanation: 'For x >= 3: 2x - 6 = x gives x = 6, y = 6. For x < 3: -(2x - 6) = x gives 6 - 2x = x, so x = 2, y = 2. Two intersection points: (2, 2) and (6, 6).' },
    { stem: 'A student graphs y = x^2 + 2 and y = 1 on a calculator. How many intersection points are there?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) 3'], correct: 0, explanation: 'Setting x^2 + 2 = 1 gives x^2 = -1, which has no real solutions. The parabola y = x^2 + 2 has its vertex at (0, 2), entirely above y = 1, so there are no intersections.' },
    { stem: 'The graphs of y = x^2 - 1 and y = -x^2 + 3 are graphed on a calculator. At what x-values do they intersect?', choices: ['A) x = -1 and x = 1', 'B) x = -sqrt(2) and x = sqrt(2)', 'C) x = -2 and x = 2', 'D) x = 0 only'], correct: 1, explanation: 'Set x^2 - 1 = -x^2 + 3. So 2x^2 = 4, x^2 = 2, x = sqrt(2) or x = -sqrt(2).' },
  ],

  /* ── 7.1  Linear Equations ── */
  '7.1': [
    { stem: 'A gym charges a one-time enrollment fee of $50 and a monthly membership fee of $30. Which equation represents the total cost C, in dollars, after m months of membership?', choices: ['A) C = 50m + 30', 'B) C = 30m + 50', 'C) C = 80m', 'D) C = 30m - 50'], correct: 1, explanation: 'The monthly fee ($30) is the rate (slope), and the one-time fee ($50) is the initial cost (y-intercept). So C = 30m + 50.' },
    { stem: 'The equation y = -2x + 8 models a car\'s distance from home in miles, where x is the number of hours driven. What does the slope -2 represent?', choices: ['A) The car starts 2 miles from home.', 'B) The car travels toward home at 2 miles per hour.', 'C) The car travels away from home at 2 miles per hour.', 'D) The car is 8 miles from home after 2 hours.'], correct: 1, explanation: 'A negative slope means the distance is decreasing, so the car is getting closer to home. The rate is 2 miles per hour.' },
    { stem: 'If 3(x - 4) = 2x + 5, what is the value of x?', choices: ['A) 9', 'B) 13', 'C) 17', 'D) 7'], correct: 2, explanation: 'Distribute: 3x - 12 = 2x + 5. Subtract 2x: x - 12 = 5. Add 12: x = 17.' },
    { stem: 'Line p passes through the points (0, -3) and (4, 5). What is the slope of line p?', choices: ['A) 1/2', 'B) 2', 'C) -2', 'D) 8'], correct: 1, explanation: 'Slope = (5 - (-3)) / (4 - 0) = 8/4 = 2.' },
    { stem: 'A plumber charges $75 for a service call plus $45 per hour of labor. If a job costs $255, how many hours of labor were charged?', choices: ['A) 3', 'B) 4', 'C) 5', 'D) 6'], correct: 1, explanation: '75 + 45h = 255. Subtract 75: 45h = 180. Divide by 45: h = 4.' },
    { stem: 'The equation of a line is 2y - 6x = 10. What is the slope of this line?', choices: ['A) -6', 'B) -3', 'C) 3', 'D) 5'], correct: 2, explanation: 'Rewrite in slope-intercept form: 2y = 6x + 10, so y = 3x + 5. The slope is 3.' },
    { stem: 'A line passes through (2, 7) and is parallel to the line y = -3x + 1. What is the equation of this line?', choices: ['A) y = -3x + 13', 'B) y = -3x + 1', 'C) y = 3x + 1', 'D) y = -3x - 13'], correct: 0, explanation: 'Parallel lines have equal slopes. Using point-slope: y - 7 = -3(x - 2), so y = -3x + 6 + 7 = -3x + 13.' },
    { stem: 'What is the x-intercept of the line 4x - 2y = 12?', choices: ['A) 3', 'B) 6', 'C) -6', 'D) 12'], correct: 0, explanation: 'At the x-intercept, y = 0. Substituting: 4x - 0 = 12, so x = 3.' },
    { stem: 'A line is perpendicular to y = (2/3)x + 5 and passes through the origin. What is its equation?', choices: ['A) y = (2/3)x', 'B) y = -(3/2)x', 'C) y = (3/2)x', 'D) y = -(2/3)x'], correct: 1, explanation: 'Perpendicular lines have negative reciprocal slopes. The negative reciprocal of 2/3 is -3/2. Through the origin: y = -(3/2)x.' },
    { stem: 'A cell phone plan charges $0.05 per text message with no monthly fee. Another plan charges $10 per month with unlimited texting. At how many texts per month do the plans cost the same?', choices: ['A) 100', 'B) 150', 'C) 200', 'D) 250'], correct: 2, explanation: 'Set 0.05t = 10. Solving: t = 200 texts.' },
    { stem: 'If the line 3x + ky = 9 has a slope of -1, what is the value of k?', choices: ['A) 1', 'B) 3', 'C) -3', 'D) 9'], correct: 1, explanation: 'Rewrite: ky = -3x + 9, so y = (-3/k)x + 9/k. The slope is -3/k = -1, so k = 3.' },
    { stem: 'A candle is 12 inches tall and burns at a rate of 0.5 inches per hour. Which equation gives the height h of the candle after t hours?', choices: ['A) h = 0.5t + 12', 'B) h = 12 - 0.5t', 'C) h = 12t - 0.5', 'D) h = -12 + 0.5t'], correct: 1, explanation: 'The candle starts at 12 inches and decreases by 0.5 inches per hour: h = 12 - 0.5t.' },
    { stem: 'Two points on a line are (-1, 4) and (3, -8). What is the slope of the line?', choices: ['A) -3', 'B) 3', 'C) -1/3', 'D) 1/3'], correct: 0, explanation: 'Slope = (-8 - 4)/(3 - (-1)) = -12/4 = -3.' },
    { stem: 'A taxi charges a flat fee of $3 plus $2 per mile. A ride-share charges no flat fee but $2.50 per mile. After how many miles do both cost the same?', choices: ['A) 4', 'B) 5', 'C) 6', 'D) 8'], correct: 2, explanation: 'Set 3 + 2m = 2.5m. So 3 = 0.5m, m = 6 miles.' },
    { stem: 'The y-intercept of the line 5x - 3y = 15 is:', choices: ['A) 3', 'B) -5', 'C) 5', 'D) 15'], correct: 1, explanation: 'Set x = 0: -3y = 15, so y = -5.' },
    { stem: 'A line has slope 4 and passes through the point (1, 7). What is the y-intercept?', choices: ['A) 1', 'B) 3', 'C) 7', 'D) 11'], correct: 1, explanation: 'Using y = mx + b: 7 = 4(1) + b, so b = 3.' },
    { stem: 'Which equation represents a horizontal line passing through the point (5, -2)?', choices: ['A) x = 5', 'B) y = -2', 'C) y = 5x - 2', 'D) x = -2'], correct: 1, explanation: 'A horizontal line has the form y = constant. Since it passes through (5, -2), the equation is y = -2.' },
    { stem: 'The lines y = 3x + 2 and y = 3x - 4 are:', choices: ['A) perpendicular', 'B) parallel', 'C) intersecting at one point', 'D) the same line'], correct: 1, explanation: 'Both lines have slope 3 but different y-intercepts (2 and -4), so they are parallel and never intersect.' },
    { stem: 'If 2(x - 3) + 4 = 3x - 8, what is x?', choices: ['A) -6', 'B) 2', 'C) 6', 'D) 8'], correct: 2, explanation: '2x - 6 + 4 = 3x - 8. So 2x - 2 = 3x - 8. Then -2 + 8 = 3x - 2x, x = 6.' },
    { stem: 'A water tank is being filled at a rate of 3 gallons per minute. If the tank already contains 20 gallons, which equation gives the amount of water w after t minutes?', choices: ['A) w = 20t + 3', 'B) w = 3t + 20', 'C) w = 23t', 'D) w = 20 - 3t'], correct: 1, explanation: 'Starting amount is 20 gallons, increasing by 3 gallons per minute: w = 3t + 20.' },
    { stem: 'The graph of y = -x + 5 crosses the x-axis at what point?', choices: ['A) (0, 5)', 'B) (5, 0)', 'C) (-5, 0)', 'D) (0, -5)'], correct: 1, explanation: 'At the x-axis, y = 0. Set 0 = -x + 5, so x = 5. The point is (5, 0).' },
    { stem: 'Which of the following lines is steepest?', choices: ['A) y = 2x + 1', 'B) y = -3x + 4', 'C) y = 0.5x - 2', 'D) y = -x + 3'], correct: 1, explanation: 'Steepness is determined by the absolute value of the slope. |2| = 2, |-3| = 3, |0.5| = 0.5, |-1| = 1. The slope with the greatest absolute value is -3, so y = -3x + 4 is steepest.' },
    { stem: 'A line passes through the points (2, 3) and (2, 9). What is the slope?', choices: ['A) 0', 'B) 3', 'C) 6', 'D) undefined'], correct: 3, explanation: 'Both points have x = 2, so this is a vertical line. The slope of a vertical line is undefined.' },
    { stem: 'If f(x) = 4x - 7, what is the value of x when f(x) = 13?', choices: ['A) 3', 'B) 4', 'C) 5', 'D) 6'], correct: 2, explanation: 'Set 4x - 7 = 13. Add 7: 4x = 20. Divide by 4: x = 5.' },
    { stem: 'A rental car costs $40 per day plus $0.25 per mile. If a customer drives m miles in one day, which expression represents the total cost?', choices: ['A) 40m + 0.25', 'B) 40.25m', 'C) 0.25m + 40', 'D) 40 - 0.25m'], correct: 2, explanation: 'Fixed daily cost is $40, variable cost is $0.25 per mile: Total = 0.25m + 40.' },
    { stem: 'The sum of three consecutive integers is 84. What is the smallest of the three?', choices: ['A) 26', 'B) 27', 'C) 28', 'D) 29'], correct: 1, explanation: 'Let the integers be n, n+1, n+2. Then 3n + 3 = 84, so 3n = 81, n = 27.' },
  ],

  /* ── 7.2  Systems of Linear Equations ── */
  '7.2': [
    { stem: 'A store sells notebooks for $3 each and pens for $1.50 each. Maria buys a total of 10 items and spends exactly $22.50. How many notebooks did she buy?', choices: ['A) 4', 'B) 5', 'C) 6', 'D) 7'], correct: 1, explanation: 'Let n = notebooks, p = pens. n + p = 10 and 3n + 1.5p = 22.50. From the first equation, p = 10 - n. Substituting: 3n + 1.5(10 - n) = 22.50 => 3n + 15 - 1.5n = 22.50 => 1.5n = 7.50 => n = 5.' },
    { stem: 'The system of equations 2x + 3y = 12 and 4x + 6y = 24 has:', choices: ['A) exactly one solution', 'B) no solution', 'C) infinitely many solutions', 'D) exactly two solutions'], correct: 2, explanation: 'The second equation is exactly twice the first (multiply 2x + 3y = 12 by 2). The equations represent the same line, so there are infinitely many solutions.' },
    { stem: 'For what value of k does the system x + 2y = 5 and 3x + ky = 10 have no solution?', choices: ['A) 2', 'B) 5', 'C) 6', 'D) 15'], correct: 2, explanation: 'For no solution, the lines must be parallel (same slope) but have different intercepts. Multiply the first equation by 3: 3x + 6y = 15. The second equation is 3x + ky = 10. For parallel lines, k must equal 6 (same coefficients on x and y), but 15 does not equal 10, so the lines never intersect.' },
    { stem: 'If 2x - y = 7 and x + y = 5, what is the value of x?', choices: ['A) 3', 'B) 4', 'C) 5', 'D) 6'], correct: 1, explanation: 'Add the two equations: (2x - y) + (x + y) = 7 + 5, which gives 3x = 12, so x = 4.' },
    { stem: 'At a bakery, muffins cost $2.50 each and scones cost $3.00 each. A customer buys 8 items for a total of $22.00. How many scones did the customer buy?', choices: ['A) 2', 'B) 4', 'C) 5', 'D) 6'], correct: 1, explanation: 'Let m = muffins, s = scones. m + s = 8 and 2.50m + 3.00s = 22.00. From the first: m = 8 - s. Substituting: 2.50(8-s) + 3s = 22 gives 20 - 2.5s + 3s = 22, so 0.5s = 2, s = 4.' },
    { stem: 'The system x - 3y = 1 and 2x - 6y = 5 has:', choices: ['A) one solution', 'B) no solution', 'C) infinitely many solutions', 'D) exactly two solutions'], correct: 1, explanation: 'Multiply the first equation by 2: 2x - 6y = 2. But the second equation says 2x - 6y = 5. Since 2 does not equal 5, the system is inconsistent and has no solution.' },
    { stem: 'A movie theater sells adult tickets for $12 and child tickets for $8. On Saturday, 150 tickets were sold for a total of $1,560. How many adult tickets were sold?', choices: ['A) 60', 'B) 80', 'C) 90', 'D) 100'], correct: 2, explanation: 'Let a = adult, c = child. a + c = 150 and 12a + 8c = 1560. From the first: c = 150 - a. Substituting: 12a + 8(150-a) = 1560 gives 12a + 1200 - 8a = 1560, so 4a = 360, a = 90.' },
    { stem: 'If x + y = 10 and x - y = 4, what is the value of y?', choices: ['A) 2', 'B) 3', 'C) 7', 'D) 14'], correct: 1, explanation: 'Add the equations: 2x = 14, so x = 7. Substitute into x + y = 10: 7 + y = 10, so y = 3.' },
    { stem: 'A farmer has chickens and cows. Together they have 30 heads and 80 legs. How many cows does the farmer have?', choices: ['A) 5', 'B) 10', 'C) 15', 'D) 20'], correct: 1, explanation: 'Let c = chickens (2 legs) and w = cows (4 legs). c + w = 30 and 2c + 4w = 80. From the first: c = 30 - w. Substituting: 2(30-w) + 4w = 80 gives 60 - 2w + 4w = 80, so 2w = 20, w = 10.' },
    { stem: 'For what value of a does the system 2x + y = 7 and 6x + 3y = a have infinitely many solutions?', choices: ['A) 7', 'B) 14', 'C) 21', 'D) 28'], correct: 2, explanation: 'Multiply the first equation by 3: 6x + 3y = 21. For infinitely many solutions, the second equation must be identical, so a = 21.' },
    { stem: 'If 3x + 2y = 16 and x - 2y = 0, what is the value of x + y?', choices: ['A) 4', 'B) 6', 'C) 8', 'D) 10'], correct: 1, explanation: 'Add the equations: 4x = 16, so x = 4. From x - 2y = 0: 4 = 2y, so y = 2. Therefore x + y = 6.' },
    { stem: 'A test has multiple-choice and essay questions. There are 30 questions total. Multiple-choice questions are worth 2 points and essay questions are worth 5 points. The test is worth 90 points total. How many essay questions are there?', choices: ['A) 8', 'B) 10', 'C) 12', 'D) 15'], correct: 1, explanation: 'Let m = MC, e = essay. m + e = 30 and 2m + 5e = 90. From first: m = 30 - e. Substituting: 2(30-e) + 5e = 90 gives 60 - 2e + 5e = 90, 3e = 30, e = 10.' },
    { stem: 'Two trains leave the same station at the same time, traveling in opposite directions. One travels at 60 mph and the other at 80 mph. After how many hours will they be 350 miles apart?', choices: ['A) 2', 'B) 2.5', 'C) 3', 'D) 3.5'], correct: 1, explanation: 'Combined speed = 60 + 80 = 140 mph. Time = distance / rate = 350 / 140 = 2.5 hours.' },
    { stem: 'The system y = 2x - 1 and y = -x + 5 has a solution at:', choices: ['A) (1, 1)', 'B) (2, 3)', 'C) (3, 2)', 'D) (3, 5)'], correct: 1, explanation: 'Set 2x - 1 = -x + 5. So 3x = 6, x = 2. Then y = 2(2) - 1 = 3. Solution: (2, 3).' },
    { stem: 'A school sells two types of tickets for a play: regular ($5) and premium ($8). If 200 tickets are sold for a total of $1,240, how many regular tickets were sold?', choices: ['A) 60', 'B) 80', 'C) 100', 'D) 120'], correct: 3, explanation: 'Let r = regular, p = premium. r + p = 200 and 5r + 8p = 1240. From first: p = 200 - r. Substituting: 5r + 8(200 - r) = 1240 gives 5r + 1600 - 8r = 1240, so -3r = -360, r = 120.' },
  ],

  /* ── 7.3  Linear Inequalities ── */
  '7.3': [
    { stem: 'A student needs at least 90 points total on two tests to earn an A. She scored 42 on the first test. Which inequality represents the score s she needs on the second test?', choices: ['A) s > 90', 'B) s >= 48', 'C) s <= 48', 'D) s >= 42'], correct: 1, explanation: '42 + s >= 90, so s >= 48. She needs at least 48 points on the second test.' },
    { stem: 'Which ordered pair is in the solution set of y > 2x - 1?', choices: ['A) (3, 4)', 'B) (2, 3)', 'C) (1, 5)', 'D) (4, 7)'], correct: 2, explanation: 'Test each pair in y > 2x - 1: (1, 5): 5 > 2(1) - 1 = 1. True. (3, 4): 4 > 5. False. (2, 3): 3 > 3. False. (4, 7): 7 > 7. False.' },
    { stem: 'A parking garage charges $5 for the first hour and $2 for each additional hour. A driver has $15. What is the maximum number of additional hours h the driver can park after the first hour?', choices: ['A) h <= 4', 'B) h <= 5', 'C) h <= 7', 'D) h <= 10'], correct: 1, explanation: 'Total cost: 5 + 2h <= 15. Solving: 2h <= 10, so h <= 5.' },
    { stem: 'Solve: -3x + 9 > 0', choices: ['A) x > 3', 'B) x < 3', 'C) x > -3', 'D) x < -3'], correct: 1, explanation: 'Subtract 9: -3x > -9. Divide by -3 and flip the inequality: x < 3.' },
    { stem: 'A company must ship at least 200 units per week. If they have already shipped 85 units by Wednesday, which inequality represents the number of units u they must ship for the rest of the week?', choices: ['A) u >= 115', 'B) u <= 115', 'C) u > 200', 'D) u >= 285'], correct: 0, explanation: '85 + u >= 200, so u >= 115.' },
    { stem: 'A delivery service charges $5 per package plus a $3 fuel surcharge per trip. A customer has $50 to spend. What is the maximum number of packages p they can send on one trip?', choices: ['A) p <= 9', 'B) p <= 10', 'C) p <= 8', 'D) p <= 7'], correct: 0, explanation: '3 + 5p <= 50. Subtract 3: 5p <= 47. Divide by 5: p <= 9.4. Since packages must be whole numbers, p <= 9.' },
    { stem: 'Which graph represents the solution to -2x + 4 >= 0?', choices: ['A) x >= 2', 'B) x <= 2', 'C) x >= -2', 'D) x <= -2'], correct: 1, explanation: '-2x + 4 >= 0 becomes -2x >= -4. Dividing by -2 and flipping the inequality: x <= 2.' },
    { stem: 'A student needs to earn at least a B average (80) across 5 quizzes. Her first four scores are 85, 72, 90, and 78. What is the minimum score she needs on the fifth quiz?', choices: ['A) 70', 'B) 75', 'C) 80', 'D) 85'], correct: 1, explanation: 'Total needed: 80 * 5 = 400. Current total: 85 + 72 + 90 + 78 = 325. Fifth quiz: 400 - 325 = 75.' },
    { stem: 'A taxi charges $3.50 plus $2.25 per mile. If a rider has at most $20, which inequality represents the maximum number of miles m the rider can travel?', choices: ['A) 2.25m <= 20', 'B) 3.50 + 2.25m <= 20', 'C) 3.50 + 2.25m >= 20', 'D) 2.25m + 20 <= 3.50'], correct: 1, explanation: 'The total fare is $3.50 + $2.25m, and it must be at most $20: 3.50 + 2.25m <= 20.' },
    { stem: 'Solve: 2(x + 3) > 5x - 9', choices: ['A) x < 5', 'B) x > 5', 'C) x < -5', 'D) x > -5'], correct: 0, explanation: 'Distribute: 2x + 6 > 5x - 9. Subtract 2x: 6 > 3x - 9. Add 9: 15 > 3x. Divide: 5 > x, or x < 5.' },
    { stem: 'A rectangular garden must have a perimeter of at most 60 feet. If the width is 10 feet, what is the maximum possible length?', choices: ['A) 15 feet', 'B) 20 feet', 'C) 25 feet', 'D) 40 feet'], correct: 1, explanation: 'Perimeter = 2(l + w) <= 60. So 2(l + 10) <= 60, l + 10 <= 30, l <= 20 feet.' },
    { stem: 'Which point is in the solution region of y < -x + 4 and y > 0?', choices: ['A) (5, 0)', 'B) (1, 2)', 'C) (4, 1)', 'D) (0, 5)'], correct: 1, explanation: 'Test (1, 2): Is 2 < -1 + 4 = 3? Yes. Is 2 > 0? Yes. So (1, 2) satisfies both inequalities.' },
    { stem: 'A person earns $15 per hour and must earn at least $600 in a week. What is the minimum number of hours h they must work?', choices: ['A) h >= 35', 'B) h >= 40', 'C) h >= 45', 'D) h >= 50'], correct: 1, explanation: '15h >= 600. Divide by 15: h >= 40.' },
  ],

  /* ── 7.4  Absolute Value Equations ── */
  '7.4': [
    { stem: 'What are the solutions to |2x - 6| = 10?', choices: ['A) x = 8 and x = -2', 'B) x = 8 and x = 2', 'C) x = 2 and x = -8', 'D) x = -2 and x = -8'], correct: 0, explanation: 'Set up two equations: 2x - 6 = 10 gives 2x = 16, x = 8. And 2x - 6 = -10 gives 2x = -4, x = -2.' },
    { stem: 'The equation |x - 3| = -5 has:', choices: ['A) two solutions', 'B) one solution', 'C) no solution', 'D) infinitely many solutions'], correct: 2, explanation: 'Absolute value is always non-negative, so it can never equal -5. There is no solution.' },
    { stem: 'If |x + 4| = 7, what is the sum of all possible values of x?', choices: ['A) -8', 'B) -4', 'C) 0', 'D) 3'], correct: 0, explanation: 'x + 4 = 7 gives x = 3. x + 4 = -7 gives x = -11. The sum is 3 + (-11) = -8.' },
    { stem: 'How many solutions does the equation |3x - 1| = 11 have?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) 3'], correct: 2, explanation: 'Since 11 > 0, the absolute value equation produces two cases: 3x - 1 = 11 and 3x - 1 = -11. Each gives one solution, so there are 2 solutions total.' },
    { stem: 'What are the solutions to |x - 5| = 3?', choices: ['A) x = 2 and x = 8', 'B) x = -2 and x = 8', 'C) x = 2 and x = -8', 'D) x = 3 and x = 5'], correct: 0, explanation: 'x - 5 = 3 gives x = 8. x - 5 = -3 gives x = 2. Solutions: x = 2 and x = 8.' },
    { stem: 'If |4x + 2| = 0, what is the value of x?', choices: ['A) 0', 'B) -1/2', 'C) 1/2', 'D) 2'], correct: 1, explanation: 'The only way an absolute value equals 0 is if the expression inside equals 0. So 4x + 2 = 0, giving x = -1/2.' },
    { stem: 'For what values of x is |x - 1| < 4?', choices: ['A) -3 < x < 5', 'B) x < 5', 'C) x > -3', 'D) -4 < x < 4'], correct: 0, explanation: '|x - 1| < 4 means -4 < x - 1 < 4. Adding 1: -3 < x < 5.' },
    { stem: 'The equation |2x + 1| = |x - 3| has how many solutions?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) 3'], correct: 2, explanation: 'Case 1: 2x + 1 = x - 3 gives x = -4. Case 2: 2x + 1 = -(x - 3) gives 2x + 1 = -x + 3, so 3x = 2, x = 2/3. Two solutions.' },
    { stem: 'What is the graph of y = |x + 2| - 3?', choices: ['A) A V-shape with vertex at (-2, -3)', 'B) A V-shape with vertex at (2, 3)', 'C) A V-shape with vertex at (-2, 3)', 'D) A V-shape with vertex at (2, -3)'], correct: 0, explanation: 'y = |x + 2| - 3 shifts the basic absolute value graph 2 units left and 3 units down, placing the vertex at (-2, -3).' },
    { stem: 'What are the solutions to |3x + 6| = 12?', choices: ['A) x = 2 and x = -6', 'B) x = 2 and x = 6', 'C) x = -2 and x = -6', 'D) x = 6 and x = -6'], correct: 0, explanation: '3x + 6 = 12 gives 3x = 6, x = 2. And 3x + 6 = -12 gives 3x = -18, x = -6. Solutions: x = 2 and x = -6.' },
    { stem: 'The equation |x - 4| = |x + 2| has how many solutions?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) infinitely many'], correct: 1, explanation: 'Case 1: x - 4 = x + 2 gives -4 = 2, which is impossible. Case 2: x - 4 = -(x + 2) gives x - 4 = -x - 2, so 2x = 2, x = 1. Only one solution.' },
  ],

  /* ── 8.1  Percentages & Multiplier Method ── */
  '8.1': [
    { stem: 'A shirt originally costs $60 and is discounted by 20%. A sales tax of 8% is then applied to the discounted price. What is the final cost?', choices: ['A) $51.84', 'B) $52.80', 'C) $50.40', 'D) $53.28'], correct: 0, explanation: 'After 20% discount: $60 * 0.80 = $48. After 8% tax: $48 * 1.08 = $51.84.' },
    { stem: 'A population increases by 15% one year and then decreases by 10% the next year. If the initial population was 2,000, what is the population after two years?', choices: ['A) 2,100', 'B) 2,070', 'C) 2,050', 'D) 1,980'], correct: 1, explanation: 'After 15% increase: 2,000 * 1.15 = 2,300. After 10% decrease: 2,300 * 0.90 = 2,070.' },
    { stem: 'If a quantity increases from 80 to 100, what is the percent increase?', choices: ['A) 20%', 'B) 25%', 'C) 80%', 'D) 125%'], correct: 1, explanation: 'Percent increase = (change / original) * 100 = (20/80) * 100 = 25%.' },
    { stem: 'A store marks up its wholesale cost by 60% to set the retail price. If an item\'s wholesale cost is $35, what is the retail price?', choices: ['A) $21', 'B) $49', 'C) $56', 'D) $95'], correct: 2, explanation: 'A 60% markup means the retail price is 1.60 times wholesale: $35 * 1.60 = $56.' },
    { stem: 'A savings account earns 3% simple interest per year. If $1,200 is deposited, how much interest is earned after 4 years?', choices: ['A) $36', 'B) $48', 'C) $120', 'D) $144'], correct: 3, explanation: 'Simple interest = principal * rate * time = $1,200 * 0.03 * 4 = $144.' },
    { stem: 'A computer originally costs $800. It is discounted by 25%, and then the discounted price is further reduced by 10%. What is the final price?', choices: ['A) $520', 'B) $540', 'C) $560', 'D) $580'], correct: 1, explanation: 'After 25% off: $800 * 0.75 = $600. After another 10% off: $600 * 0.90 = $540.' },
    { stem: 'A town\'s population decreased from 25,000 to 20,000 over 5 years. What was the percent decrease?', choices: ['A) 5%', 'B) 15%', 'C) 20%', 'D) 25%'], correct: 2, explanation: 'Percent decrease = (25000 - 20000)/25000 * 100 = 5000/25000 * 100 = 20%.' },
    { stem: 'An item costs $40 after a 20% discount. What was the original price?', choices: ['A) $48', 'B) $50', 'C) $56', 'D) $60'], correct: 1, explanation: 'If the item was discounted 20%, the customer paid 80% of the original price. So 0.80 * original = $40, meaning original = $50.' },
    { stem: 'A company\'s revenue grew by 10% in the first year and 20% in the second year. If the initial revenue was $100,000, what was the revenue after two years?', choices: ['A) $130,000', 'B) $132,000', 'C) $125,000', 'D) $120,000'], correct: 1, explanation: 'After year 1: $100,000 * 1.10 = $110,000. After year 2: $110,000 * 1.20 = $132,000.' },
    { stem: 'A salesperson earns a 6% commission on all sales. If she wants to earn at least $3,000 in commission, what is the minimum amount she must sell?', choices: ['A) $18,000', 'B) $30,000', 'C) $50,000', 'D) $180,000'], correct: 2, explanation: '0.06 * sales = $3,000. Sales = $3,000 / 0.06 = $50,000.' },
    { stem: 'A jacket is on sale for 30% off. During a special event, an additional 20% is taken off the sale price. What is the total percent discount from the original price?', choices: ['A) 44%', 'B) 50%', 'C) 56%', 'D) 60%'], correct: 0, explanation: 'After 30% off: 0.70 of original. After additional 20% off sale price: 0.70 * 0.80 = 0.56 of original. Total discount = 1 - 0.56 = 44%.' },
    { stem: 'A bank charges 4% annual compound interest. If $500 is deposited, what is the balance after 2 years?', choices: ['A) $540.00', 'B) $540.80', 'C) $541.20', 'D) $580.00'], correct: 1, explanation: 'Compound interest: 500(1.04)^2 = 500 * 1.0816 = $540.80.' },
    { stem: 'In a class of 40 students, 75% passed the final exam. How many students did NOT pass?', choices: ['A) 5', 'B) 10', 'C) 15', 'D) 30'], correct: 1, explanation: '25% did not pass. 0.25 * 40 = 10 students.' },
    { stem: 'If a $200 investment grows to $250, what is the percent increase?', choices: ['A) 20%', 'B) 25%', 'C) 50%', 'D) 80%'], correct: 1, explanation: 'Percent increase = (250 - 200)/200 * 100 = 50/200 * 100 = 25%.' },
    { stem: 'A stock loses 20% of its value on Monday and gains 20% on Tuesday. Compared to its original value, the stock is now:', choices: ['A) unchanged', 'B) down 4%', 'C) up 4%', 'D) down 2%'], correct: 1, explanation: 'After 20% loss: 0.80 of original. After 20% gain: 0.80 * 1.20 = 0.96 of original. The stock is down 4%.' },
    { stem: 'A $60 meal has an 8% sales tax added, and then the customer leaves a 20% tip on the pre-tax amount. What is the total cost?', choices: ['A) $72.00', 'B) $76.80', 'C) $79.60', 'D) $81.60'], correct: 1, explanation: 'Tax: $60 * 0.08 = $4.80. Tip: $60 * 0.20 = $12.00. Total: $60 + $4.80 + $12.00 = $76.80.' },
    { stem: 'A population of 5,000 decreases by 8% each year. What is the population after 1 year?', choices: ['A) 4,400', 'B) 4,500', 'C) 4,600', 'D) 4,920'], correct: 2, explanation: '5,000 * 0.92 = 4,600.' },
    { stem: 'A TV originally priced at $400 is first marked up by 25% and then offered at a 20% discount. What is the final selling price?', choices: ['A) $380', 'B) $400', 'C) $420', 'D) $500'], correct: 1, explanation: 'After 25% markup: $400 * 1.25 = $500. After 20% discount: $500 * 0.80 = $400.' },
    { stem: 'If 35% of the students in a school of 600 are enrolled in at least one AP class, how many students are NOT enrolled in any AP class?', choices: ['A) 210', 'B) 310', 'C) 390', 'D) 400'], correct: 2, explanation: '65% are not enrolled in AP. 0.65 * 600 = 390.' },
  ],

  /* ── 8.2  Ratios, Rates & Proportions ── */
  '8.2': [
    { stem: 'A recipe calls for 3 cups of flour for every 2 cups of sugar. If a baker uses 9 cups of flour, how many cups of sugar are needed?', choices: ['A) 4', 'B) 5', 'C) 6', 'D) 7'], correct: 2, explanation: 'Set up a proportion: 3/2 = 9/x. Cross-multiply: 3x = 18, so x = 6 cups of sugar.' },
    { stem: 'A car travels 210 miles on 7 gallons of gas. At this rate, how many gallons are needed to travel 360 miles?', choices: ['A) 10', 'B) 12', 'C) 14', 'D) 15'], correct: 1, explanation: 'Rate = 210/7 = 30 miles per gallon. Gallons needed = 360/30 = 12.' },
    { stem: 'The ratio of boys to girls in a class is 3:5. If there are 40 students total, how many boys are in the class?', choices: ['A) 12', 'B) 15', 'C) 20', 'D) 25'], correct: 1, explanation: 'Total parts = 3 + 5 = 8. Boys = (3/8) * 40 = 15.' },
    { stem: 'A machine produces 180 widgets in 3 hours. At this rate, how many widgets does it produce in 8 hours?', choices: ['A) 360', 'B) 420', 'C) 480', 'D) 540'], correct: 2, explanation: 'Rate = 180/3 = 60 widgets per hour. In 8 hours: 60 * 8 = 480.' },
    { stem: 'On a map, 2 centimeters represents 50 kilometers. If two cities are 7 centimeters apart on the map, what is the actual distance between them?', choices: ['A) 150 km', 'B) 175 km', 'C) 200 km', 'D) 350 km'], correct: 1, explanation: 'Set up a proportion: 2/50 = 7/x. Cross-multiply: 2x = 350, so x = 175 km.' },
    { stem: 'If 5 workers can paint a house in 12 days, how many days would it take 10 workers to paint the same house?', choices: ['A) 4', 'B) 6', 'C) 8', 'D) 24'], correct: 1, explanation: 'This is an inverse proportion. Work = workers * days. 5 * 12 = 10 * d, so d = 60/10 = 6 days.' },
    { stem: 'A scale model of a building is 15 inches tall. If the scale is 1 inch : 8 feet, how tall is the actual building?', choices: ['A) 80 feet', 'B) 100 feet', 'C) 120 feet', 'D) 150 feet'], correct: 2, explanation: '15 inches * 8 feet/inch = 120 feet.' },
    { stem: 'A runner completes 3 laps in 18 minutes. At this rate, how many laps can the runner complete in 1 hour?', choices: ['A) 8', 'B) 10', 'C) 12', 'D) 15'], correct: 1, explanation: 'Rate = 3 laps / 18 min = 1 lap / 6 min. In 60 minutes: 60/6 = 10 laps.' },
    { stem: 'In a mixture, the ratio of water to concentrate is 4:1. If you need 10 liters of the mixture, how many liters of concentrate are needed?', choices: ['A) 1', 'B) 2', 'C) 2.5', 'D) 4'], correct: 1, explanation: 'Total parts = 4 + 1 = 5. Concentrate = (1/5) * 10 = 2 liters.' },
    { stem: 'A train travels 240 miles in 3 hours. A car travels the same distance in 4 hours. How much faster is the train than the car in miles per hour?', choices: ['A) 10 mph', 'B) 20 mph', 'C) 30 mph', 'D) 40 mph'], correct: 1, explanation: 'Train speed = 240/3 = 80 mph. Car speed = 240/4 = 60 mph. Difference = 20 mph.' },
    { stem: 'A photograph is 4 inches by 6 inches. It is enlarged so that the longer side is 15 inches. What is the length of the shorter side of the enlargement?', choices: ['A) 8 inches', 'B) 10 inches', 'C) 12 inches', 'D) 13 inches'], correct: 1, explanation: 'Scale factor = 15/6 = 2.5. Shorter side = 4 * 2.5 = 10 inches.' },
    { stem: 'Two gears are meshed. Gear A has 24 teeth and Gear B has 16 teeth. If Gear A makes 20 rotations, how many rotations does Gear B make?', choices: ['A) 13.3', 'B) 20', 'C) 30', 'D) 40'], correct: 2, explanation: 'The ratio is inverse: 24 * 20 = 16 * x. So x = 480/16 = 30 rotations.' },
    { stem: 'A concrete mixture uses cement, sand, and gravel in the ratio 1:2:4. If 28 bags of material are needed total, how many bags of sand are required?', choices: ['A) 4', 'B) 6', 'C) 8', 'D) 16'], correct: 2, explanation: 'Total parts = 1 + 2 + 4 = 7. Sand = (2/7) * 28 = 8 bags.' },
    { stem: 'If 8 printers can complete a job in 6 hours, how long would 12 printers take to complete the same job?', choices: ['A) 3 hours', 'B) 4 hours', 'C) 5 hours', 'D) 9 hours'], correct: 1, explanation: 'This is an inverse proportion. 8 * 6 = 12 * t, so t = 48/12 = 4 hours.' },
    { stem: 'A medication dosage is 5 mg per kilogram of body weight. How much medication should a 70 kg patient receive?', choices: ['A) 14 mg', 'B) 75 mg', 'C) 350 mg', 'D) 700 mg'], correct: 2, explanation: 'Dosage = 5 mg/kg * 70 kg = 350 mg.' },
    { stem: 'A car uses 3 gallons of gas to travel 90 miles. At this rate, how many gallons are needed for a 600-mile trip?', choices: ['A) 15', 'B) 18', 'C) 20', 'D) 24'], correct: 2, explanation: 'Rate = 90/3 = 30 miles per gallon. Gallons = 600/30 = 20.' },
  ],

  /* ── 8.3  Unit Conversions ── */
  '8.3': [
    { stem: 'A scientist measures a specimen at 2.5 meters long. What is this length in centimeters?', choices: ['A) 0.025 cm', 'B) 25 cm', 'C) 250 cm', 'D) 2,500 cm'], correct: 2, explanation: '1 meter = 100 centimeters, so 2.5 meters = 250 centimeters.' },
    { stem: 'A runner completes a 10-kilometer race. How many miles is this, given that 1 mile is approximately 1.6 kilometers?', choices: ['A) 5.0 miles', 'B) 6.25 miles', 'C) 8.0 miles', 'D) 16.0 miles'], correct: 1, explanation: '10 km / 1.6 km per mile = 6.25 miles.' },
    { stem: 'Water flows at a rate of 3 gallons per minute. How many gallons flow in 2 hours?', choices: ['A) 6', 'B) 36', 'C) 180', 'D) 360'], correct: 3, explanation: '2 hours = 120 minutes. At 3 gallons per minute: 3 * 120 = 360 gallons.' },
    { stem: 'A speed limit sign shows 60 miles per hour. What is this speed in feet per second? (1 mile = 5,280 feet)', choices: ['A) 44 ft/s', 'B) 88 ft/s', 'C) 132 ft/s', 'D) 176 ft/s'], correct: 1, explanation: '60 mph = 60 * 5,280 feet per hour = 316,800 feet per hour. Divide by 3,600 seconds: 316,800 / 3,600 = 88 ft/s.' },
    { stem: 'A car\'s fuel tank holds 14 gallons. If the car gets 28 miles per gallon, how many kilometers can it travel on a full tank? (1 mile = 1.6 km)', choices: ['A) 392 km', 'B) 448 km', 'C) 627.2 km', 'D) 784 km'], correct: 2, explanation: 'Distance in miles: 14 * 28 = 392 miles. Convert to km: 392 * 1.6 = 627.2 km.' },
    { stem: 'A recipe calls for 350 grams of flour. If you only have a scale that measures in ounces, approximately how many ounces of flour do you need? (1 ounce = 28.35 grams)', choices: ['A) 10.0 oz', 'B) 12.3 oz', 'C) 14.2 oz', 'D) 16.5 oz'], correct: 1, explanation: '350 grams / 28.35 grams per ounce = approximately 12.3 ounces.' },
    { stem: 'A factory produces 450 units per 8-hour shift. What is the production rate in units per minute?', choices: ['A) 0.625', 'B) 0.9375', 'C) 1.5', 'D) 56.25'], correct: 1, explanation: '8 hours = 480 minutes. Rate = 450/480 = 0.9375 units per minute.' },
    { stem: 'An athlete runs 100 meters in 10 seconds. What is this speed in kilometers per hour?', choices: ['A) 10 km/h', 'B) 24 km/h', 'C) 36 km/h', 'D) 100 km/h'], correct: 2, explanation: '100 m/10 s = 10 m/s. Convert: 10 m/s * 3600 s/hr / 1000 m/km = 36 km/h.' },
    { stem: 'A room is 15 feet long and 12 feet wide. What is the area in square meters? (1 foot = 0.3048 meters)', choices: ['A) 12.5 sq m', 'B) 16.7 sq m', 'C) 18.0 sq m', 'D) 180.0 sq m'], correct: 1, explanation: 'Area in sq ft = 15 * 12 = 180 sq ft. Convert: 180 * (0.3048)^2 = 180 * 0.0929 = 16.7 sq m.' },
    { stem: 'A European recipe lists the oven temperature as 200 degrees Celsius. What is this in Fahrenheit? (F = (9/5)C + 32)', choices: ['A) 356 F', 'B) 392 F', 'C) 400 F', 'D) 432 F'], correct: 1, explanation: 'F = (9/5)(200) + 32 = 360 + 32 = 392 F.' },
    { stem: 'A pipe delivers water at 2 liters per second. How many cubic meters of water does it deliver in 1 hour? (1 cubic meter = 1,000 liters)', choices: ['A) 3.6', 'B) 7.2', 'C) 120', 'D) 7,200'], correct: 1, explanation: '2 liters/sec * 3,600 sec = 7,200 liters. 7,200 / 1,000 = 7.2 cubic meters.' },
    { stem: 'An object weighs 5 pounds. What is its approximate mass in kilograms? (1 kg = 2.2 pounds)', choices: ['A) 1.1 kg', 'B) 2.3 kg', 'C) 7.2 kg', 'D) 11.0 kg'], correct: 1, explanation: '5 / 2.2 = approximately 2.27, which rounds to 2.3 kg.' },
  ],

  /* ── 8.4  Statistics: Mean/Median/SD ── */
  '8.4': [
    { stem: 'The data set {12, 15, 15, 18, 20, 22, 25} has a median of:', choices: ['A) 15', 'B) 17', 'C) 18', 'D) 20'], correct: 2, explanation: 'The data set has 7 values. The median is the 4th value when arranged in order: 18.' },
    { stem: 'If the mean of five numbers is 14, and four of the numbers are 10, 12, 15, and 18, what is the fifth number?', choices: ['A) 14', 'B) 15', 'C) 12', 'D) 10'], correct: 1, explanation: 'Sum of five numbers = 5 * 14 = 70. Sum of four known numbers = 10 + 12 + 15 + 18 = 55. Fifth number = 70 - 55 = 15.' },
    { stem: 'Adding an outlier value of 100 to the data set {10, 12, 13, 14, 15} would most affect which measure?', choices: ['A) Median', 'B) Mode', 'C) Mean', 'D) Range and mean equally'], correct: 2, explanation: 'The mean is strongly affected by extreme values (outliers). The median changes only slightly. The range also changes, but the mean shifts more dramatically relative to its typical movement.' },
    { stem: 'Two data sets have the same mean. Data set A: {8, 10, 12}. Data set B: {2, 10, 18}. Which data set has the greater standard deviation?', choices: ['A) Data set A', 'B) Data set B', 'C) They have equal standard deviations.', 'D) Cannot be determined.'], correct: 1, explanation: 'Both have a mean of 10, but Data set B has values farther from the mean (spread: 2, 10, 18 vs. 8, 10, 12), so B has the greater standard deviation.' },
    { stem: 'A survey of 200 students found that 60 prefer basketball, 50 prefer soccer, 40 prefer tennis, and 50 prefer swimming. What percentage of students prefer either basketball or soccer?', choices: ['A) 25%', 'B) 30%', 'C) 55%', 'D) 110%'], correct: 2, explanation: '60 + 50 = 110 students prefer basketball or soccer. 110/200 = 0.55 = 55%.' },
    { stem: 'A student scores 78, 85, 90, and 92 on four tests. What score does the student need on the fifth test to achieve an overall average of 88?', choices: ['A) 88', 'B) 90', 'C) 95', 'D) 100'], correct: 2, explanation: 'Total needed: 88 * 5 = 440. Current total: 78 + 85 + 90 + 92 = 345. Fifth test: 440 - 345 = 95.' },
    { stem: 'A data set has values: 3, 7, 7, 9, 10, 12, 15. If the value 15 is removed, which measure of central tendency changes the most?', choices: ['A) Mean', 'B) Median', 'C) Mode', 'D) All change equally'], correct: 0, explanation: 'The mean is most affected by removing an extreme value. The median shifts slightly, the mode stays at 7, but the mean changes noticeably because 15 pulled the average up.' },
    { stem: 'In a survey, the margin of error is plus or minus 3%. If 52% of respondents supported a proposal, which conclusion is most appropriate?', choices: ['A) The proposal is guaranteed to pass.', 'B) Support is somewhere between 49% and 55%, so the result is too close to call.', 'C) Exactly 52% of the population supports the proposal.', 'D) The survey is invalid.'], correct: 1, explanation: 'With a 3% margin of error, the true value lies between 49% and 55%. Since this range includes 50%, the result is too close to call with certainty.' },
    { stem: 'A box plot shows Q1 = 20, median = 35, Q3 = 50. What is the interquartile range (IQR)?', choices: ['A) 15', 'B) 20', 'C) 30', 'D) 35'], correct: 2, explanation: 'IQR = Q3 - Q1 = 50 - 20 = 30.' },
    { stem: 'Data set A has a standard deviation of 2.5 and Data set B has a standard deviation of 8.1. Which data set has more spread?', choices: ['A) Data set A', 'B) Data set B', 'C) They have equal spread.', 'D) Cannot be determined without knowing the means.'], correct: 1, explanation: 'Standard deviation measures spread. A larger standard deviation means more spread, so Data set B (8.1) has more spread than Data set A (2.5).' },
    { stem: 'A researcher surveys 200 students and finds that 120 prefer math over English. What is the probability that a randomly selected student from this group prefers math?', choices: ['A) 0.40', 'B) 0.50', 'C) 0.60', 'D) 0.80'], correct: 2, explanation: 'Probability = 120/200 = 0.60.' },
    { stem: 'The five-number summary for a data set is: Min = 5, Q1 = 12, Median = 18, Q3 = 25, Max = 40. A value is considered an outlier if it is more than 1.5 * IQR above Q3. Is 40 an outlier?', choices: ['A) Yes, because 40 > 25.', 'B) Yes, because 40 > Q3 + 1.5 * IQR = 44.5.', 'C) No, because 40 < Q3 + 1.5 * IQR = 44.5.', 'D) No, because 40 is the maximum.'], correct: 2, explanation: 'IQR = 25 - 12 = 13. Upper fence = Q3 + 1.5 * IQR = 25 + 19.5 = 44.5. Since 40 < 44.5, it is not an outlier.' },
    { stem: 'A sample of 100 students has a mean test score of 72 with a standard deviation of 8. Approximately what percentage of students scored between 64 and 80?', choices: ['A) 50%', 'B) 68%', 'C) 95%', 'D) 99%'], correct: 1, explanation: '64 and 80 are each one standard deviation from the mean (72 - 8 = 64, 72 + 8 = 80). By the empirical rule, approximately 68% of data falls within one standard deviation.' },
    { stem: 'A company surveys 500 employees about job satisfaction. If 320 report being satisfied, what is the relative frequency of satisfied employees?', choices: ['A) 0.36', 'B) 0.50', 'C) 0.64', 'D) 0.80'], correct: 2, explanation: 'Relative frequency = 320/500 = 0.64.' },
    { stem: 'Two classes take the same test. Class A has a mean of 82 and standard deviation of 3. Class B has a mean of 82 and standard deviation of 10. Which statement is correct?', choices: ['A) Class A performed better on average.', 'B) Class B performed better on average.', 'C) Both classes performed the same on average, but Class A had more consistent scores.', 'D) Both classes performed the same on average, but Class B had more consistent scores.'], correct: 2, explanation: 'Both have the same mean (82), but Class A\'s lower standard deviation (3 vs. 10) means its scores were more tightly clustered around the mean -- more consistent.' },
    { stem: 'In a data set, the mean is 50 and the median is 60. The distribution is most likely:', choices: ['A) skewed right (positively skewed)', 'B) skewed left (negatively skewed)', 'C) perfectly symmetric', 'D) bimodal'], correct: 1, explanation: 'When the mean is less than the median, the distribution is skewed left (negatively skewed). The lower values pull the mean down below the median.' },
    { stem: 'A random sample of 1,000 voters shows 48% support for a candidate, with a margin of error of plus or minus 3%. Which statement is correct?', choices: ['A) The candidate will definitely lose.', 'B) The candidate\'s true support is between 45% and 51%, so the outcome is uncertain.', 'C) Exactly 48% of all voters support the candidate.', 'D) The margin of error means the survey is unreliable.'], correct: 1, explanation: 'With a 3% margin of error, the true support is between 45% and 51%. Since this range includes 50%, the election outcome remains uncertain.' },
  ],

  /* ── 9.1  Quadratics: The Three Forms ── */
  '9.1': [
    { stem: 'What are the solutions to x^2 - 5x + 6 = 0?', choices: ['A) x = 1 and x = 6', 'B) x = 2 and x = 3', 'C) x = -2 and x = -3', 'D) x = -1 and x = -6'], correct: 1, explanation: 'Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3.' },
    { stem: 'The vertex form of a quadratic is y = 2(x - 3)^2 + 5. What is the vertex?', choices: ['A) (3, 5)', 'B) (-3, 5)', 'C) (3, -5)', 'D) (-3, -5)'], correct: 0, explanation: 'In vertex form y = a(x - h)^2 + k, the vertex is (h, k) = (3, 5).' },
    { stem: 'A ball is thrown upward, and its height in feet is modeled by h(t) = -16t^2 + 64t + 5, where t is in seconds. What is the maximum height?', choices: ['A) 64 feet', 'B) 69 feet', 'C) 80 feet', 'D) 85 feet'], correct: 1, explanation: 'The maximum occurs at t = -b/(2a) = -64/(2*(-16)) = 2 seconds. h(2) = -16(4) + 64(2) + 5 = -64 + 128 + 5 = 69 feet.' },
    { stem: 'Which equation has roots at x = -1 and x = 4?', choices: ['A) x^2 + 3x - 4 = 0', 'B) x^2 - 3x - 4 = 0', 'C) x^2 - 5x + 4 = 0', 'D) x^2 + 5x + 4 = 0'], correct: 1, explanation: 'If roots are -1 and 4, the equation is (x + 1)(x - 4) = x^2 - 3x - 4 = 0.' },
    { stem: 'The function f(x) = (x - 1)(x + 5) has zeros at:', choices: ['A) x = 1 and x = 5', 'B) x = -1 and x = -5', 'C) x = 1 and x = -5', 'D) x = -1 and x = 5'], correct: 2, explanation: 'Set each factor to zero: x - 1 = 0 gives x = 1, and x + 5 = 0 gives x = -5.' },
    { stem: 'A parabola opens downward and has its vertex at (2, 9). Which could be its equation?', choices: ['A) y = (x - 2)^2 + 9', 'B) y = -(x - 2)^2 + 9', 'C) y = -(x + 2)^2 - 9', 'D) y = (x + 2)^2 + 9'], correct: 1, explanation: 'A downward-opening parabola has a negative leading coefficient. The vertex (2, 9) gives y = -(x - 2)^2 + 9.' },
    { stem: 'What is the axis of symmetry for the parabola y = 2x^2 - 8x + 3?', choices: ['A) x = 1', 'B) x = 2', 'C) x = 3', 'D) x = 4'], correct: 1, explanation: 'The axis of symmetry is x = -b/(2a) = -(-8)/(2*2) = 8/4 = 2.' },
    { stem: 'The quadratic y = x^2 - 6x + 5 can be rewritten in factored form as:', choices: ['A) (x - 1)(x - 5)', 'B) (x + 1)(x + 5)', 'C) (x - 2)(x - 3)', 'D) (x + 1)(x - 5)'], correct: 0, explanation: 'Find two numbers that multiply to 5 and add to -6: -1 and -5. So y = (x - 1)(x - 5).' },
    { stem: 'A projectile\'s height is given by h(t) = -5t^2 + 30t. When does it hit the ground (h = 0)?', choices: ['A) t = 3 seconds', 'B) t = 5 seconds', 'C) t = 6 seconds', 'D) t = 10 seconds'], correct: 2, explanation: 'Set -5t^2 + 30t = 0. Factor: -5t(t - 6) = 0. So t = 0 or t = 6. The projectile hits the ground at t = 6 seconds.' },
    { stem: 'Convert y = (x + 3)^2 - 4 to standard form.', choices: ['A) y = x^2 + 6x + 5', 'B) y = x^2 + 3x - 4', 'C) y = x^2 + 6x + 13', 'D) y = x^2 - 6x + 5'], correct: 0, explanation: 'Expand: (x + 3)^2 - 4 = x^2 + 6x + 9 - 4 = x^2 + 6x + 5.' },
    { stem: 'The sum of the roots of 2x^2 - 10x + 8 = 0 is:', choices: ['A) -5', 'B) 4', 'C) 5', 'D) 8'], correct: 2, explanation: 'By Vieta\'s formulas, the sum of roots = -b/a = -(-10)/2 = 5.' },
    { stem: 'For what values of x is x^2 - 4x - 5 < 0?', choices: ['A) x < -1 or x > 5', 'B) -1 < x < 5', 'C) -5 < x < 1', 'D) x < -5 or x > 1'], correct: 1, explanation: 'Factor: (x - 5)(x + 1) < 0. The parabola opens upward and is negative between the roots: -1 < x < 5.' },
    { stem: 'A quadratic function has zeros at x = -3 and x = 7, and its leading coefficient is 2. What is the equation?', choices: ['A) y = 2(x + 3)(x - 7)', 'B) y = 2(x - 3)(x + 7)', 'C) y = (x + 3)(x - 7)', 'D) y = 2(x + 3)(x + 7)'], correct: 0, explanation: 'The zeros are x = -3 and x = 7, giving factors (x + 3) and (x - 7). With leading coefficient 2: y = 2(x + 3)(x - 7).' },
    { stem: 'The quadratic y = x^2 + 2x - 15 is written in vertex form as:', choices: ['A) y = (x + 1)^2 - 16', 'B) y = (x - 1)^2 - 16', 'C) y = (x + 1)^2 + 16', 'D) y = (x + 2)^2 - 15'], correct: 0, explanation: 'Complete the square: x^2 + 2x - 15 = (x^2 + 2x + 1) - 1 - 15 = (x + 1)^2 - 16.' },
    { stem: 'If y = 3x^2 - 12, what are the x-intercepts?', choices: ['A) x = 2 and x = -2', 'B) x = 4 and x = -4', 'C) x = 6 and x = -6', 'D) x = 12 and x = -12'], correct: 0, explanation: 'Set y = 0: 3x^2 = 12, x^2 = 4, x = 2 or x = -2.' },
    { stem: 'The product of two consecutive positive integers is 72. What are the integers?', choices: ['A) 7 and 8', 'B) 8 and 9', 'C) 9 and 10', 'D) 6 and 12'], correct: 1, explanation: 'Let the integers be n and n + 1. n(n+1) = 72. Testing: 8 * 9 = 72.' },
    { stem: 'The function f(x) = -x^2 + 4x + 5 has a maximum value of:', choices: ['A) 4', 'B) 5', 'C) 9', 'D) 13'], correct: 2, explanation: 'The maximum occurs at x = -b/(2a) = -4/(2*(-1)) = 2. f(2) = -4 + 8 + 5 = 9.' },
    { stem: 'Which equation represents a parabola with vertex at (-1, 4) that opens upward?', choices: ['A) y = -(x + 1)^2 + 4', 'B) y = (x + 1)^2 + 4', 'C) y = (x - 1)^2 + 4', 'D) y = -(x - 1)^2 + 4'], correct: 1, explanation: 'Vertex (-1, 4) means h = -1 and k = 4. Upward-opening means positive leading coefficient. So y = (x + 1)^2 + 4.' },
    { stem: 'The equation x^2 + 8x + 12 = 0 can be solved by factoring. What are the solutions?', choices: ['A) x = -2 and x = -6', 'B) x = 2 and x = 6', 'C) x = -3 and x = -4', 'D) x = 3 and x = 4'], correct: 0, explanation: 'Factor: (x + 2)(x + 6) = 0. So x = -2 or x = -6.' },
  ],

  /* ── 9.2  The Discriminant ── */
  '9.2': [
    { stem: 'The equation 2x^2 + 4x + 5 = 0 has how many real solutions?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) Cannot be determined'], correct: 0, explanation: 'Discriminant = b^2 - 4ac = 16 - 40 = -24. Since the discriminant is negative, there are no real solutions.' },
    { stem: 'For what value of k does x^2 + kx + 9 = 0 have exactly one real solution?', choices: ['A) 3', 'B) 6', 'C) 9', 'D) 12'], correct: 1, explanation: 'For one solution, discriminant = 0: k^2 - 4(1)(9) = 0, so k^2 = 36, and k = 6 (taking the positive value).' },
    { stem: 'If the discriminant of a quadratic equation is 25, the equation has:', choices: ['A) no real solutions', 'B) exactly one real solution', 'C) two distinct real solutions', 'D) two complex solutions'], correct: 2, explanation: 'A positive discriminant means the quadratic has two distinct real solutions. Since 25 > 0, there are two real solutions.' },
    { stem: 'The graph of y = ax^2 + bx + c touches the x-axis at exactly one point. What must be true about the discriminant b^2 - 4ac?', choices: ['A) It is positive.', 'B) It equals zero.', 'C) It is negative.', 'D) It equals 1.'], correct: 1, explanation: 'Touching the x-axis at exactly one point means one repeated root, which occurs when the discriminant equals zero.' },
    { stem: 'The equation 3x^2 - 12x + 12 = 0 has how many real solutions?', choices: ['A) 0', 'B) 1', 'C) 2', 'D) Cannot be determined'], correct: 1, explanation: 'Discriminant = (-12)^2 - 4(3)(12) = 144 - 144 = 0. A discriminant of zero means exactly one real solution (a repeated root).' },
    { stem: 'For which value of c does x^2 + 6x + c = 0 have two distinct real solutions?', choices: ['A) c = 9', 'B) c = 10', 'C) c = 8', 'D) c = 15'], correct: 2, explanation: 'For two distinct real solutions, discriminant > 0: 36 - 4c > 0, so c < 9. Only c = 8 satisfies this condition.' },
    { stem: 'If the discriminant of a quadratic equation is 0, the graph of the corresponding parabola:', choices: ['A) does not cross the x-axis', 'B) crosses the x-axis at two points', 'C) touches the x-axis at exactly one point (the vertex)', 'D) opens downward'], correct: 2, explanation: 'A discriminant of 0 means one repeated root, so the parabola touches the x-axis at exactly one point, which is its vertex.' },
    { stem: 'The equation x^2 + bx + 16 = 0 has exactly one real solution. What are the possible values of b?', choices: ['A) b = 4 only', 'B) b = 8 or b = -8', 'C) b = 16 only', 'D) b = 4 or b = -4'], correct: 1, explanation: 'For one real solution: b^2 - 4(1)(16) = 0, so b^2 = 64, giving b = 8 or b = -8.' },
    { stem: 'The equation x^2 - 10x + k = 0 has no real solutions. Which could be the value of k?', choices: ['A) 20', 'B) 25', 'C) 26', 'D) 24'], correct: 2, explanation: 'For no real solutions: discriminant < 0. b^2 - 4ac = 100 - 4k < 0, so k > 25. Only k = 26 satisfies this.' },
    { stem: 'A quadratic equation has a discriminant of 49. What can be concluded about its solutions?', choices: ['A) The solutions are complex numbers.', 'B) There is exactly one real solution.', 'C) There are two distinct real solutions, and they are rational.', 'D) There are no solutions.'], correct: 2, explanation: '49 is a positive perfect square. A positive discriminant means two distinct real solutions, and since 49 is a perfect square, the solutions are rational.' },
    { stem: 'For what values of k does the equation x^2 - 6x + k = 0 have two distinct real solutions?', choices: ['A) k < 9', 'B) k = 9', 'C) k > 9', 'D) k < 0'], correct: 0, explanation: 'Discriminant = 36 - 4k > 0. So 4k < 36, meaning k < 9. Any k less than 9 gives two distinct real solutions.' },
    { stem: 'The equation 5x^2 + 2x + 1 = 0 has:', choices: ['A) two distinct real solutions', 'B) one repeated real solution', 'C) no real solutions', 'D) cannot be determined'], correct: 2, explanation: 'Discriminant = 4 - 20 = -16. Since -16 < 0, the equation has no real solutions.' },
  ],

  /* ── 9.3  Exponential Functions ── */
  '9.3': [
    { stem: 'A bacterial colony doubles every 3 hours. If there are 500 bacteria initially, which expression gives the number of bacteria after t hours?', choices: ['A) 500(2)^(t/3)', 'B) 500(2)^(3t)', 'C) 500(3)^(t/2)', 'D) 1000(2)^t'], correct: 0, explanation: 'The colony doubles (factor of 2) every 3 hours, so the exponent is t/3: N = 500(2)^(t/3).' },
    { stem: 'A car depreciates in value by 12% each year. If its current value is $25,000, which expression represents its value after n years?', choices: ['A) 25000(0.12)^n', 'B) 25000(1.12)^n', 'C) 25000(0.88)^n', 'D) 25000 - 0.12n'], correct: 2, explanation: 'Losing 12% per year means retaining 88% each year. The multiplier is 0.88, so V = 25000(0.88)^n.' },
    { stem: 'The function f(x) = 3(1.05)^x models the price of a product in dollars. What does 1.05 represent?', choices: ['A) The initial price is $1.05.', 'B) The price increases by 5% per time period.', 'C) The price increases by $1.05 per time period.', 'D) The price decreases by 5% per time period.'], correct: 1, explanation: 'In exponential growth y = a(b)^x, b = 1.05 means a 5% increase per period (since 1.05 = 1 + 0.05).' },
    { stem: 'The value of an investment is modeled by V(t) = 5000(1.08)^t, where t is the number of years. What is the value after 2 years?', choices: ['A) $5,400', 'B) $5,800', 'C) $5,832', 'D) $10,800'], correct: 2, explanation: 'V(2) = 5000(1.08)^2 = 5000(1.1664) = $5,832.' },
    { stem: 'A radioactive substance has a half-life of 10 years. If the initial amount is 200 grams, which expression gives the amount remaining after t years?', choices: ['A) 200(0.5)^(t/10)', 'B) 200(0.5)^(10t)', 'C) 200(2)^(t/10)', 'D) 100(0.5)^t'], correct: 0, explanation: 'A half-life of 10 years means the substance is halved every 10 years. The factor is (0.5) raised to the power (t/10).' },
    { stem: 'A population of bacteria triples every 4 hours. If there are 100 bacteria initially, how many are there after 12 hours?', choices: ['A) 300', 'B) 900', 'C) 2,700', 'D) 8,100'], correct: 2, explanation: 'In 12 hours, there are 12/4 = 3 tripling periods. Population = 100 * 3^3 = 100 * 27 = 2,700.' },
    { stem: 'The function f(x) = 500(0.85)^x models the value of a machine in dollars after x years. What does 0.85 represent?', choices: ['A) The machine loses $0.85 per year.', 'B) The machine retains 85% of its value each year.', 'C) The machine is worth $0.85 initially.', 'D) The machine gains 85% value each year.'], correct: 1, explanation: 'A base of 0.85 = 1 - 0.15 means the machine retains 85% (loses 15%) of its value each year.' },
    { stem: 'If f(x) = 2^x, what is f(x + 3) in terms of f(x)?', choices: ['A) f(x) + 3', 'B) 3f(x)', 'C) 8f(x)', 'D) f(x)^3'], correct: 2, explanation: 'f(x + 3) = 2^(x+3) = 2^x * 2^3 = 8 * 2^x = 8f(x).' },
    { stem: 'A town\'s population is modeled by P(t) = 10000(1.03)^t. How long will it take for the population to double?', choices: ['A) About 15 years', 'B) About 23 years', 'C) About 33 years', 'D) About 50 years'], correct: 1, explanation: 'We need (1.03)^t = 2. Using the rule of 72: 72/3 = 24, or solving: t = ln(2)/ln(1.03) is approximately 23.4 years.' },
    { stem: 'Which function represents exponential decay?', choices: ['A) f(x) = 3(1.5)^x', 'B) f(x) = 3(0.5)^x', 'C) f(x) = 3x + 5', 'D) f(x) = 3x^2'], correct: 1, explanation: 'Exponential decay has a base between 0 and 1. The base 0.5 in option B is less than 1, so it represents decay.' },
    { stem: 'A scientist measures 800 grams of a substance. If it decays at 5% per hour, approximately how much remains after 3 hours?', choices: ['A) 650 g', 'B) 686 g', 'C) 722 g', 'D) 760 g'], correct: 1, explanation: '800 * (0.95)^3 = 800 * 0.857375 = approximately 686 grams.' },
    { stem: 'The number of downloads of an app doubles every month. If there were 1,000 downloads in January, how many total downloads occurred from January through March?', choices: ['A) 3,000', 'B) 4,000', 'C) 7,000', 'D) 8,000'], correct: 2, explanation: 'January: 1,000. February: 2,000. March: 4,000. Total: 1,000 + 2,000 + 4,000 = 7,000.' },
    { stem: 'Which of the following is equivalent to 4^(3/2)?', choices: ['A) 6', 'B) 8', 'C) 12', 'D) 16'], correct: 1, explanation: '4^(3/2) = (4^(1/2))^3 = 2^3 = 8.' },
    { stem: 'An exponential function passes through the points (0, 5) and (1, 15). What is the equation?', choices: ['A) y = 5(3)^x', 'B) y = 3(5)^x', 'C) y = 5(2)^x', 'D) y = 15(5)^x'], correct: 0, explanation: 'At x = 0: y = a*b^0 = a = 5. At x = 1: y = 5*b = 15, so b = 3. The equation is y = 5(3)^x.' },
  ],

  /* ── 9.4  Operations with Polynomials ── */
  '9.4': [
    { stem: 'Simplify: (3x^2 + 2x - 5) - (x^2 - 4x + 3)', choices: ['A) 2x^2 + 6x - 8', 'B) 2x^2 - 2x - 2', 'C) 4x^2 - 2x - 2', 'D) 2x^2 + 6x - 2'], correct: 0, explanation: 'Distribute the negative: 3x^2 + 2x - 5 - x^2 + 4x - 3 = 2x^2 + 6x - 8.' },
    { stem: 'If p(x) = x^3 - 2x + 1, what is p(-1)?', choices: ['A) -2', 'B) 0', 'C) 2', 'D) 4'], correct: 2, explanation: 'p(-1) = (-1)^3 - 2(-1) + 1 = -1 + 2 + 1 = 2.' },
    { stem: 'Which expression is equivalent to (x + 3)(x^2 - 3x + 9)?', choices: ['A) x^3 + 27', 'B) x^3 - 27', 'C) x^3 + 9x + 27', 'D) x^3 - 9x + 27'], correct: 0, explanation: 'This is the sum of cubes pattern: (a + b)(a^2 - ab + b^2) = a^3 + b^3. Here a = x, b = 3, so the result is x^3 + 27.' },
    { stem: 'What is the remainder when x^3 + 2x^2 - 5x + 1 is divided by (x - 1)?', choices: ['A) -1', 'B) 0', 'C) -3', 'D) -2'], correct: 0, explanation: 'By the Remainder Theorem, substitute x = 1: 1 + 2 - 5 + 1 = -1.' },
    { stem: 'Expand and simplify: (2x - 3)^2', choices: ['A) 4x^2 - 9', 'B) 4x^2 - 6x + 9', 'C) 4x^2 - 12x + 9', 'D) 2x^2 - 12x + 9'], correct: 2, explanation: '(2x - 3)^2 = (2x)^2 - 2(2x)(3) + 3^2 = 4x^2 - 12x + 9.' },
    { stem: 'If f(x) = x^3 + 3x^2 - x - 3, which is a factor of f(x)?', choices: ['A) (x + 4)', 'B) (x + 1)', 'C) (x - 2)', 'D) (x + 5)'], correct: 1, explanation: 'Test x = -1: f(-1) = -1 + 3 + 1 - 3 = 0. Since f(-1) = 0, (x + 1) is a factor.' },
    { stem: 'Simplify: (x^2 + 5x + 6) / (x + 2)', choices: ['A) x + 2', 'B) x + 3', 'C) x + 6', 'D) x^2 + 3'], correct: 1, explanation: 'Factor the numerator: x^2 + 5x + 6 = (x + 2)(x + 3). Cancel (x + 2): the result is (x + 3).' },
    { stem: 'What is the degree of the polynomial 5x^4 - 3x^2 + 7x - 1?', choices: ['A) 2', 'B) 3', 'C) 4', 'D) 5'], correct: 2, explanation: 'The degree is the highest exponent of x, which is 4.' },
    { stem: 'If p(x) = 2x^2 + 3x - 5, what is p(0)?', choices: ['A) -5', 'B) 0', 'C) 2', 'D) 5'], correct: 0, explanation: 'p(0) = 2(0) + 3(0) - 5 = -5.' },
    { stem: 'Multiply: (x + 2)(x^2 - 2x + 4)', choices: ['A) x^3 + 8', 'B) x^3 - 8', 'C) x^3 + 4x + 8', 'D) x^3 - 2x^2 + 4x'], correct: 0, explanation: 'This is the sum of cubes pattern: (a + b)(a^2 - ab + b^2) = a^3 + b^3. Here a = x, b = 2, so the result is x^3 + 8.' },
    { stem: 'What is the remainder when 2x^3 - 5x + 3 is divided by (x + 1)?', choices: ['A) 0', 'B) 6', 'C) -4', 'D) 10'], correct: 1, explanation: 'By the Remainder Theorem, substitute x = -1: 2(-1)^3 - 5(-1) + 3 = -2 + 5 + 3 = 6.' },
    { stem: 'If f(x) = x^4 - 1, what is f(x) factored completely?', choices: ['A) (x^2 + 1)(x + 1)(x - 1)', 'B) (x^2 - 1)^2', 'C) (x + 1)^2(x - 1)^2', 'D) (x^2 + 1)(x^2 + 1)'], correct: 0, explanation: 'x^4 - 1 = (x^2 + 1)(x^2 - 1) = (x^2 + 1)(x + 1)(x - 1).' },
    { stem: 'Simplify: (x^3 - 8) / (x - 2)', choices: ['A) x^2 + 2x + 4', 'B) x^2 - 4', 'C) x^2 - 2x + 4', 'D) x + 4'], correct: 0, explanation: 'x^3 - 8 = (x - 2)(x^2 + 2x + 4) using the difference of cubes formula. Dividing by (x - 2) gives x^2 + 2x + 4.' },
    { stem: 'The polynomial f(x) = x^3 - 6x^2 + 11x - 6 has x = 1 as a root. What are the other roots?', choices: ['A) x = 2 and x = 3', 'B) x = -2 and x = -3', 'C) x = 1 and x = 6', 'D) x = 2 and x = -3'], correct: 0, explanation: 'Since x = 1 is a root, (x - 1) is a factor. Dividing: x^3 - 6x^2 + 11x - 6 = (x - 1)(x^2 - 5x + 6) = (x - 1)(x - 2)(x - 3). Roots: x = 1, 2, 3.' },
    { stem: 'What is the end behavior of f(x) = -2x^4 + 3x^2 - 1 as x approaches positive infinity?', choices: ['A) f(x) approaches positive infinity', 'B) f(x) approaches negative infinity', 'C) f(x) approaches 0', 'D) f(x) approaches -1'], correct: 1, explanation: 'The leading term is -2x^4. Since the leading coefficient is negative and the degree is even, f(x) approaches negative infinity as x goes to both positive and negative infinity.' },
    { stem: 'The polynomial f(x) has degree 3 and a positive leading coefficient. As x approaches negative infinity, f(x) approaches:', choices: ['A) positive infinity', 'B) negative infinity', 'C) 0', 'D) cannot be determined'], correct: 1, explanation: 'A cubic (odd degree) with a positive leading coefficient: as x approaches negative infinity, f(x) approaches negative infinity. As x approaches positive infinity, f(x) approaches positive infinity.' },
    { stem: 'How many times does the graph of f(x) = x^3 - 9x cross the x-axis?', choices: ['A) 1', 'B) 2', 'C) 3', 'D) 4'], correct: 2, explanation: 'Set x^3 - 9x = 0. Factor: x(x^2 - 9) = x(x - 3)(x + 3) = 0. Solutions: x = 0, 3, -3. Three x-intercepts.' },
  ],

  /* ── 10.1  Lines & Angles ── */
  '10.1': [
    { stem: 'Two parallel lines are cut by a transversal. One of the angles formed measures 65 degrees. What is the measure of the supplementary angle on the same side?', choices: ['A) 25 degrees', 'B) 65 degrees', 'C) 115 degrees', 'D) 130 degrees'], correct: 2, explanation: 'Supplementary angles sum to 180 degrees. 180 - 65 = 115 degrees.' },
    { stem: 'Two angles are complementary. One angle measures 37 degrees. What is the measure of the other?', choices: ['A) 37 degrees', 'B) 53 degrees', 'C) 143 degrees', 'D) 63 degrees'], correct: 1, explanation: 'Complementary angles sum to 90 degrees. 90 - 37 = 53 degrees.' },
    { stem: 'In the figure, line m is parallel to line n and a transversal crosses both. If angle 1 = 72 degrees, what is the measure of the alternate interior angle?', choices: ['A) 18 degrees', 'B) 72 degrees', 'C) 108 degrees', 'D) 144 degrees'], correct: 1, explanation: 'Alternate interior angles formed by parallel lines and a transversal are equal, so the alternate interior angle also measures 72 degrees.' },
    { stem: 'Two lines intersect, forming four angles. If one of the angles measures 130 degrees, what is the measure of the adjacent angle?', choices: ['A) 50 degrees', 'B) 65 degrees', 'C) 130 degrees', 'D) 230 degrees'], correct: 0, explanation: 'Adjacent angles formed by intersecting lines are supplementary: 180 - 130 = 50 degrees.' },
    { stem: 'A straight angle is bisected by a ray. What is the measure of each resulting angle?', choices: ['A) 45 degrees', 'B) 60 degrees', 'C) 90 degrees', 'D) 180 degrees'], correct: 2, explanation: 'A straight angle is 180 degrees. Bisecting it creates two 90-degree angles.' },
    { stem: 'In a figure, angles A and B are vertical angles. If angle A = 5x + 10 and angle B = 3x + 40, what is the value of x?', choices: ['A) 10', 'B) 15', 'C) 20', 'D) 25'], correct: 1, explanation: 'Vertical angles are equal: 5x + 10 = 3x + 40. Solve: 2x = 30, x = 15.' },
    { stem: 'Two parallel lines are cut by a transversal. If one of the corresponding angles is 110 degrees, what is the measure of the co-interior (same-side interior) angle?', choices: ['A) 70 degrees', 'B) 90 degrees', 'C) 110 degrees', 'D) 180 degrees'], correct: 0, explanation: 'Co-interior angles (same-side interior) are supplementary when lines are parallel: 180 - 110 = 70 degrees.' },
    { stem: 'Three angles meet at a point on a straight line. If two of the angles measure 45 degrees and 75 degrees, what is the third angle?', choices: ['A) 30 degrees', 'B) 60 degrees', 'C) 90 degrees', 'D) 120 degrees'], correct: 1, explanation: 'Angles on a straight line sum to 180 degrees. Third angle = 180 - 45 - 75 = 60 degrees.' },
    { stem: 'If two angles are supplementary and one is twice the other, what are the two angles?', choices: ['A) 45 and 90 degrees', 'B) 60 and 120 degrees', 'C) 30 and 150 degrees', 'D) 90 and 90 degrees'], correct: 1, explanation: 'Let the angles be x and 2x. x + 2x = 180, so 3x = 180, x = 60. The angles are 60 and 120 degrees.' },
    { stem: 'An exterior angle of a triangle measures 130 degrees. If one of the non-adjacent interior angles is 55 degrees, what is the other non-adjacent interior angle?', choices: ['A) 50 degrees', 'B) 55 degrees', 'C) 75 degrees', 'D) 125 degrees'], correct: 2, explanation: 'An exterior angle equals the sum of the two non-adjacent interior angles. 130 = 55 + x, so x = 75 degrees.' },
    { stem: 'The sum of the interior angles of a regular polygon is 1080 degrees. How many sides does the polygon have?', choices: ['A) 6', 'B) 7', 'C) 8', 'D) 10'], correct: 2, explanation: 'Sum = (n-2) * 180. So (n-2) * 180 = 1080, n-2 = 6, n = 8.' },
    { stem: 'What is the measure of each interior angle of a regular hexagon?', choices: ['A) 90 degrees', 'B) 108 degrees', 'C) 120 degrees', 'D) 135 degrees'], correct: 2, explanation: 'Each interior angle = (n-2)*180/n = (6-2)*180/6 = 720/6 = 120 degrees.' },
    { stem: 'Two angles are vertical angles. If one measures (3x + 10) degrees and the other measures (5x - 20) degrees, what is x?', choices: ['A) 5', 'B) 10', 'C) 15', 'D) 20'], correct: 2, explanation: 'Vertical angles are equal: 3x + 10 = 5x - 20. So 30 = 2x, x = 15.' },
    { stem: 'A regular pentagon has an interior angle of:', choices: ['A) 90 degrees', 'B) 100 degrees', 'C) 108 degrees', 'D) 120 degrees'], correct: 2, explanation: 'Interior angle of a regular polygon = (n-2)*180/n = (5-2)*180/5 = 540/5 = 108 degrees.' },
    { stem: 'In a figure, three lines intersect at a single point, creating six angles. If two adjacent angles measure 40 degrees and 60 degrees, what does the third angle on that side of the line measure?', choices: ['A) 40 degrees', 'B) 60 degrees', 'C) 80 degrees', 'D) 100 degrees'], correct: 2, explanation: 'Three angles on one side of a straight line sum to 180 degrees. Third angle = 180 - 40 - 60 = 80 degrees.' },
    { stem: 'A regular octagon has each exterior angle measuring:', choices: ['A) 30 degrees', 'B) 45 degrees', 'C) 60 degrees', 'D) 72 degrees'], correct: 1, explanation: 'Each exterior angle of a regular polygon = 360/n = 360/8 = 45 degrees.' },
    { stem: 'In a triangle, one angle is 90 degrees and another is 35 degrees. What is the measure of the third angle?', choices: ['A) 45 degrees', 'B) 55 degrees', 'C) 65 degrees', 'D) 90 degrees'], correct: 1, explanation: 'The angles of a triangle sum to 180 degrees. Third angle = 180 - 90 - 35 = 55 degrees.' },
  ],

  /* ── 10.2  Triangles ── */
  '10.2': [
    { stem: 'A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?', choices: ['A) 10', 'B) 12', 'C) 14', 'D) 48'], correct: 0, explanation: 'By the Pythagorean theorem: c^2 = 6^2 + 8^2 = 36 + 64 = 100, so c = 10.' },
    { stem: 'In a triangle, two sides have lengths 7 and 10. Which of the following could be the length of the third side?', choices: ['A) 2', 'B) 3', 'C) 17', 'D) 12'], correct: 3, explanation: 'By the triangle inequality, the third side must be greater than |10 - 7| = 3 and less than 10 + 7 = 17. Only 12 falls in the range (3, 17).' },
    { stem: 'The angles of a triangle are in the ratio 2:3:4. What is the measure of the largest angle?', choices: ['A) 60 degrees', 'B) 70 degrees', 'C) 80 degrees', 'D) 90 degrees'], correct: 2, explanation: 'Total parts = 2 + 3 + 4 = 9. Each part = 180/9 = 20 degrees. Largest angle = 4 * 20 = 80 degrees.' },
    { stem: 'A triangle has a base of 12 cm and a height of 9 cm. What is its area?', choices: ['A) 21 cm^2', 'B) 42 cm^2', 'C) 54 cm^2', 'D) 108 cm^2'], correct: 2, explanation: 'Area = (1/2) * base * height = (1/2)(12)(9) = 54 cm^2.' },
    { stem: 'In a 30-60-90 triangle, the side opposite the 30-degree angle is 5. What is the length of the hypotenuse?', choices: ['A) 5', 'B) 10', 'C) 5 * sqrt(3)', 'D) 5 * sqrt(2)'], correct: 1, explanation: 'In a 30-60-90 triangle, the hypotenuse is twice the shorter leg. Since the side opposite 30 degrees is the shorter leg, the hypotenuse is 2 * 5 = 10.' },
    { stem: 'Two similar triangles have a scale factor of 3:5. If the area of the smaller triangle is 27 cm^2, what is the area of the larger triangle?', choices: ['A) 45 cm^2', 'B) 75 cm^2', 'C) 108 cm^2', 'D) 135 cm^2'], correct: 1, explanation: 'When triangles are similar with scale factor k, the areas scale by k^2. So (3/5)^2 = 9/25. If small = 27, then 27 = (9/25) * large, so large = 27 * 25/9 = 75 cm^2.' },
    { stem: 'A right triangle has one leg of 5 and a hypotenuse of 13. What is the area of the triangle?', choices: ['A) 30', 'B) 32.5', 'C) 60', 'D) 65'], correct: 0, explanation: 'Find the other leg: b^2 = 13^2 - 5^2 = 169 - 25 = 144, so b = 12. Area = (1/2)(5)(12) = 30.' },
    { stem: 'An equilateral triangle has a side length of 8. What is its height?', choices: ['A) 4', 'B) 4*sqrt(3)', 'C) 8', 'D) 8*sqrt(3)'], correct: 1, explanation: 'The height of an equilateral triangle = (side * sqrt(3)) / 2 = (8 * sqrt(3)) / 2 = 4*sqrt(3).' },
    { stem: 'In a 45-45-90 triangle, one leg is 7. What is the hypotenuse?', choices: ['A) 7', 'B) 14', 'C) 7*sqrt(2)', 'D) 7*sqrt(3)'], correct: 2, explanation: 'In a 45-45-90 triangle, the hypotenuse = leg * sqrt(2) = 7*sqrt(2).' },
    { stem: 'A triangle has sides of 5, 12, and 13. Is it a right triangle?', choices: ['A) Yes, because 5 + 12 = 17 > 13', 'B) Yes, because 5^2 + 12^2 = 13^2', 'C) No, because 5^2 + 12^2 does not equal 13^2', 'D) No, because all three sides are different'], correct: 1, explanation: 'Check: 5^2 + 12^2 = 25 + 144 = 169 = 13^2. Since a^2 + b^2 = c^2, it is a right triangle.' },
    { stem: 'The perimeter of a triangle is 36 cm. Two sides are 10 cm and 14 cm. What is the length of the third side?', choices: ['A) 8 cm', 'B) 10 cm', 'C) 12 cm', 'D) 24 cm'], correct: 2, explanation: 'Third side = 36 - 10 - 14 = 12 cm.' },
    { stem: 'A right triangle has a hypotenuse of 10 and one angle of 30 degrees. What is the length of the side opposite the 30-degree angle?', choices: ['A) 5', 'B) 5*sqrt(3)', 'C) 10', 'D) 10*sqrt(3)'], correct: 0, explanation: 'In a 30-60-90 triangle, the side opposite 30 degrees is half the hypotenuse: 10/2 = 5.' },
    { stem: 'The area of an equilateral triangle with side length s is (s^2 * sqrt(3))/4. What is the area when s = 6?', choices: ['A) 6*sqrt(3)', 'B) 9*sqrt(3)', 'C) 12*sqrt(3)', 'D) 18*sqrt(3)'], correct: 1, explanation: 'Area = (6^2 * sqrt(3))/4 = (36 * sqrt(3))/4 = 9*sqrt(3).' },
    { stem: 'A rectangle has a diagonal of 13 and a width of 5. What is the length?', choices: ['A) 8', 'B) 10', 'C) 12', 'D) 14'], correct: 2, explanation: 'Using the Pythagorean theorem: l^2 + 5^2 = 13^2. l^2 = 169 - 25 = 144. l = 12.' },
    { stem: 'Two sides of a triangle are 8 and 15. The angle between them is 90 degrees. What is the area?', choices: ['A) 23', 'B) 40', 'C) 60', 'D) 120'], correct: 2, explanation: 'For a right triangle with legs 8 and 15: Area = (1/2)(8)(15) = 60.' },
    { stem: 'A triangle has vertices at (0, 0), (6, 0), and (3, 4). What is its area?', choices: ['A) 8', 'B) 10', 'C) 12', 'D) 24'], correct: 2, explanation: 'Using the base-height method: base = 6 (along x-axis), height = 4 (y-coordinate of third vertex). Area = (1/2)(6)(4) = 12.' },
    { stem: 'A right triangle has legs measuring 9 and 12. What is the length of the median to the hypotenuse?', choices: ['A) 5', 'B) 7.5', 'C) 10', 'D) 10.5'], correct: 1, explanation: 'Hypotenuse = sqrt(81 + 144) = sqrt(225) = 15. The median to the hypotenuse of a right triangle equals half the hypotenuse: 15/2 = 7.5.' },
    { stem: 'An isosceles triangle has two sides of length 10 and a base of 12. What is the height drawn to the base?', choices: ['A) 6', 'B) 8', 'C) 10', 'D) 12'], correct: 1, explanation: 'The height bisects the base, creating two right triangles with hypotenuse 10 and base 6. Height = sqrt(100 - 36) = sqrt(64) = 8.' },
    { stem: 'A triangle has sides of length 7, 24, and 25. What type of triangle is it?', choices: ['A) Acute', 'B) Right', 'C) Obtuse', 'D) Equilateral'], correct: 1, explanation: 'Check: 7^2 + 24^2 = 49 + 576 = 625 = 25^2. Since a^2 + b^2 = c^2, this is a right triangle.' },
    { stem: 'Two similar triangles have corresponding sides in the ratio 2:5. If the perimeter of the smaller triangle is 18 cm, what is the perimeter of the larger triangle?', choices: ['A) 36 cm', 'B) 45 cm', 'C) 72 cm', 'D) 90 cm'], correct: 1, explanation: 'Similar triangles have perimeters in the same ratio as their corresponding sides. Perimeter of larger = 18 * (5/2) = 45 cm.' },
  ],

  /* ── 10.3  Trigonometry (SOHCAHTOA) ── */
  '10.3': [
    { stem: 'In a right triangle, the side opposite angle A is 5 and the hypotenuse is 13. What is sin(A)?', choices: ['A) 5/12', 'B) 5/13', 'C) 12/13', 'D) 13/5'], correct: 1, explanation: 'sin(A) = opposite/hypotenuse = 5/13.' },
    { stem: 'A ladder leans against a wall, making a 60-degree angle with the ground. If the ladder is 20 feet long, how high up the wall does it reach? (sin 60 is approximately 0.866)', choices: ['A) 10.0 feet', 'B) 14.1 feet', 'C) 17.3 feet', 'D) 20.0 feet'], correct: 2, explanation: 'The height is the side opposite the 60-degree angle. sin(60) = height/20, so height = 20 * 0.866 = 17.3 feet.' },
    { stem: 'If cos(theta) = 3/5, what is tan(theta)?', choices: ['A) 3/4', 'B) 4/3', 'C) 4/5', 'D) 5/3'], correct: 1, explanation: 'If cos = 3/5, the adjacent side is 3 and hypotenuse is 5. By the Pythagorean theorem, the opposite side is 4. tan = opposite/adjacent = 4/3.' },
    { stem: 'A right triangle has a hypotenuse of 15 and one leg of 9. What is the length of the other leg?', choices: ['A) 6', 'B) 10', 'C) 12', 'D) 14'], correct: 2, explanation: 'By the Pythagorean theorem: b^2 = 15^2 - 9^2 = 225 - 81 = 144, so b = 12.' },
    { stem: 'In a right triangle, angle A is 45 degrees and the hypotenuse is 10. What is the length of each leg?', choices: ['A) 5', 'B) 5 * sqrt(2)', 'C) 10 * sqrt(2)', 'D) 10'], correct: 1, explanation: 'In a 45-45-90 triangle, each leg = hypotenuse / sqrt(2) = 10 / sqrt(2) = 5 * sqrt(2).' },
    { stem: 'In a right triangle, sin(A) = 0.6. What is cos(A)?', choices: ['A) 0.4', 'B) 0.6', 'C) 0.8', 'D) 1.0'], correct: 2, explanation: 'Using sin^2(A) + cos^2(A) = 1: 0.36 + cos^2(A) = 1, so cos^2(A) = 0.64, and cos(A) = 0.8.' },
    { stem: 'A 10-foot ladder leans against a wall, making a 70-degree angle with the ground. How high up the wall does the ladder reach? (sin 70 is approximately 0.94)', choices: ['A) 7.0 feet', 'B) 8.4 feet', 'C) 9.4 feet', 'D) 10.0 feet'], correct: 2, explanation: 'Height = hypotenuse * sin(angle) = 10 * sin(70) = 10 * 0.94 = 9.4 feet.' },
    { stem: 'If tan(theta) = 1, what is the measure of angle theta?', choices: ['A) 30 degrees', 'B) 45 degrees', 'C) 60 degrees', 'D) 90 degrees'], correct: 1, explanation: 'tan(45) = 1. When the opposite and adjacent sides are equal, the angle is 45 degrees.' },
    { stem: 'A right triangle has legs of 8 and 15. What is sin(A), where A is the angle opposite the side of length 8?', choices: ['A) 8/15', 'B) 8/17', 'C) 15/17', 'D) 17/8'], correct: 1, explanation: 'First find the hypotenuse: sqrt(64 + 225) = sqrt(289) = 17. sin(A) = opposite/hypotenuse = 8/17.' },
    { stem: 'In a right triangle, the angle of elevation from the ground to the top of a building is 35 degrees, and the observer is 100 feet from the base. What is the height of the building? (tan 35 is approximately 0.70)', choices: ['A) 35 feet', 'B) 50 feet', 'C) 70 feet', 'D) 100 feet'], correct: 2, explanation: 'Height = distance * tan(angle) = 100 * tan(35) = 100 * 0.70 = 70 feet.' },
    { stem: 'What is the exact value of cos(60 degrees)?', choices: ['A) 0', 'B) 1/2', 'C) sqrt(2)/2', 'D) sqrt(3)/2'], correct: 1, explanation: 'cos(60) = 1/2. This is a standard value from the 30-60-90 triangle.' },
    { stem: 'In a right triangle, the opposite side is 12 and the adjacent side is 5. What is the length of the hypotenuse?', choices: ['A) 7', 'B) 13', 'C) 17', 'D) 60'], correct: 1, explanation: 'c = sqrt(12^2 + 5^2) = sqrt(144 + 25) = sqrt(169) = 13.' },
    { stem: 'If sin(A) = 3/5, what is cos(A)?', choices: ['A) 2/5', 'B) 3/4', 'C) 4/5', 'D) 5/3'], correct: 2, explanation: 'Using sin^2 + cos^2 = 1: (9/25) + cos^2 = 1, cos^2 = 16/25, cos = 4/5.' },
    { stem: 'A tree casts a shadow 20 feet long when the angle of elevation of the sun is 50 degrees. What is the approximate height of the tree? (tan 50 is approximately 1.19)', choices: ['A) 16.8 feet', 'B) 20.0 feet', 'C) 23.8 feet', 'D) 50.0 feet'], correct: 2, explanation: 'Height = shadow length * tan(angle) = 20 * 1.19 = 23.8 feet.' },
    { stem: 'What is the exact value of sin(30 degrees)?', choices: ['A) 0', 'B) 1/2', 'C) sqrt(2)/2', 'D) sqrt(3)/2'], correct: 1, explanation: 'sin(30) = 1/2. This is a standard value from the 30-60-90 triangle: the side opposite 30 degrees is half the hypotenuse.' },
    { stem: 'In a right triangle, tan(A) = 3/4. What is sin(A)?', choices: ['A) 3/4', 'B) 3/5', 'C) 4/5', 'D) 5/3'], correct: 1, explanation: 'tan(A) = opposite/adjacent = 3/4. The hypotenuse = sqrt(9 + 16) = sqrt(25) = 5. sin(A) = opposite/hypotenuse = 3/5.' },
  ],

  /* ── 10.4  Circles ── */
  '10.4': [
    { stem: 'A circle has the equation (x - 2)^2 + (y + 3)^2 = 25. What are the center and radius?', choices: ['A) Center (2, -3), radius 5', 'B) Center (-2, 3), radius 5', 'C) Center (2, -3), radius 25', 'D) Center (-2, 3), radius 25'], correct: 0, explanation: 'The standard form (x - h)^2 + (y - k)^2 = r^2 gives center (h, k) = (2, -3) and r^2 = 25, so r = 5.' },
    { stem: 'A circle has a diameter of 10 inches. What is its area?', choices: ['A) 10pi square inches', 'B) 25pi square inches', 'C) 50pi square inches', 'D) 100pi square inches'], correct: 1, explanation: 'Radius = 10/2 = 5. Area = pi * r^2 = 25pi square inches.' },
    { stem: 'A central angle of a circle measures 90 degrees. If the radius is 8, what is the length of the arc it intercepts?', choices: ['A) 2pi', 'B) 4pi', 'C) 8pi', 'D) 16pi'], correct: 1, explanation: 'Arc length = (theta/360) * 2*pi*r = (90/360) * 2*pi*8 = (1/4)(16pi) = 4pi.' },
    { stem: 'A circle has the equation x^2 + y^2 = 36. What is the radius?', choices: ['A) 6', 'B) 12', 'C) 18', 'D) 36'], correct: 0, explanation: 'The equation x^2 + y^2 = r^2 has r^2 = 36, so r = 6.' },
    { stem: 'Two tangent lines are drawn from an external point to a circle. If the angle between the tangent lines is 60 degrees, what is the measure of the minor arc between the two points of tangency?', choices: ['A) 60 degrees', 'B) 120 degrees', 'C) 240 degrees', 'D) 300 degrees'], correct: 1, explanation: 'The angle between two tangents from an external point equals (major arc - minor arc) / 2. Since major + minor = 360, and the angle is 60: 60 = (360 - 2 * minor) / 2 gives minor = 120 degrees.' },
    { stem: 'A circle has circumference 20pi. What is the radius?', choices: ['A) 5', 'B) 10', 'C) 20', 'D) 40'], correct: 1, explanation: 'Circumference = 2*pi*r. So 20*pi = 2*pi*r, giving r = 10.' },
    { stem: 'A sector of a circle has a central angle of 120 degrees and a radius of 6. What is the area of the sector?', choices: ['A) 4pi', 'B) 8pi', 'C) 12pi', 'D) 24pi'], correct: 2, explanation: 'Sector area = (angle/360) * pi * r^2 = (120/360) * pi * 36 = (1/3) * 36pi = 12pi.' },
    { stem: 'The equation of a circle is x^2 + y^2 - 6x + 4y = 12. What are the center and radius?', choices: ['A) Center (3, -2), radius 5', 'B) Center (-3, 2), radius 5', 'C) Center (3, -2), radius 25', 'D) Center (6, -4), radius 12'], correct: 0, explanation: 'Complete the square: (x^2 - 6x + 9) + (y^2 + 4y + 4) = 12 + 9 + 4 = 25. So (x-3)^2 + (y+2)^2 = 25. Center is (3, -2) and radius = 5.' },
    { stem: 'A point lies on a circle with center (0, 0) and radius 5. If the point\'s x-coordinate is 3, what are the possible y-coordinates?', choices: ['A) 4 and -4', 'B) 2 and -2', 'C) 3 and -3', 'D) 5 and -5'], correct: 0, explanation: 'Using x^2 + y^2 = 25: 9 + y^2 = 25, so y^2 = 16, and y = 4 or y = -4.' },
    { stem: 'An inscribed angle in a circle intercepts an arc of 100 degrees. What is the measure of the inscribed angle?', choices: ['A) 50 degrees', 'B) 100 degrees', 'C) 150 degrees', 'D) 200 degrees'], correct: 0, explanation: 'An inscribed angle is half the intercepted arc: 100/2 = 50 degrees.' },
    { stem: 'Two chords intersect inside a circle. The segments of one chord are 3 and 8. One segment of the other chord is 4. What is the length of the other segment?', choices: ['A) 5', 'B) 6', 'C) 7', 'D) 8'], correct: 1, explanation: 'When two chords intersect, the products of their segments are equal: 3 * 8 = 4 * x. So 24 = 4x, giving x = 6.' },
    { stem: 'What is the area of a circle with circumference 12pi?', choices: ['A) 12pi', 'B) 24pi', 'C) 36pi', 'D) 144pi'], correct: 2, explanation: 'Circumference = 2*pi*r = 12*pi, so r = 6. Area = pi*r^2 = 36pi.' },
    { stem: 'A circle has center (3, -1) and passes through the point (7, -1). What is the equation of the circle?', choices: ['A) (x-3)^2 + (y+1)^2 = 4', 'B) (x-3)^2 + (y+1)^2 = 16', 'C) (x+3)^2 + (y-1)^2 = 16', 'D) (x-3)^2 + (y+1)^2 = 8'], correct: 1, explanation: 'The radius is the distance from (3,-1) to (7,-1) = 4. Equation: (x-3)^2 + (y+1)^2 = 16.' },
    { stem: 'A sector has an arc length of 6pi and a radius of 9. What is the central angle in degrees?', choices: ['A) 60 degrees', 'B) 90 degrees', 'C) 120 degrees', 'D) 150 degrees'], correct: 2, explanation: 'Arc length = (angle/360) * 2*pi*r. So 6pi = (angle/360) * 18pi. Simplify: 6/18 = angle/360, so angle = 120 degrees.' },
    { stem: 'A tangent line to a circle at point P is perpendicular to:', choices: ['A) any chord of the circle', 'B) the diameter', 'C) the radius drawn to point P', 'D) the x-axis'], correct: 2, explanation: 'A fundamental property of tangent lines: a tangent to a circle is perpendicular to the radius drawn to the point of tangency.' },
    { stem: 'A circle has a radius of 7. What is its area?', choices: ['A) 14pi', 'B) 49pi', 'C) 7pi', 'D) 28pi'], correct: 1, explanation: 'Area = pi * r^2 = pi * 49 = 49pi.' },
    { stem: 'A central angle of 60 degrees intercepts an arc on a circle with radius 12. What is the arc length?', choices: ['A) 2pi', 'B) 4pi', 'C) 6pi', 'D) 12pi'], correct: 1, explanation: 'Arc length = (angle/360) * 2*pi*r = (60/360) * 2*pi*12 = (1/6) * 24pi = 4pi.' },
    { stem: 'The equation of a circle is (x + 4)^2 + (y - 1)^2 = 9. What is the diameter of the circle?', choices: ['A) 3', 'B) 6', 'C) 9', 'D) 18'], correct: 1, explanation: 'From the standard form, r^2 = 9, so r = 3. The diameter = 2r = 6.' },
  ],
}

export const SAT_MATH_QUESTIONS = [

  // ═══════════════════════════════════════════════
  //  Chapters 6.1–6.2: Foundations (8 questions)
  // ═══════════════════════════════════════════════

  // 6.1 — Desmos: Regressions & Data Modeling
  {
    id: 'sat-math-1',
    chapter: '6.1',
    type: 'Foundations',
    stem: 'A researcher collects the data points (1, 5), (2, 11), (3, 19), (4, 29) and uses a graphing calculator to perform a quadratic regression of the form y = ax² + bx + c. The calculator returns the model y = x² + 3x + 1. According to this model, what is the predicted y-value when x = 7?',
    choices: ['A) 64', 'B) 71', 'C) 73', 'D) 85'],
    correct: 1,
    explanation: 'Substitute x = 7 into the model: y = (7)² + 3(7) + 1 = 49 + 21 + 1 = 71. You can verify the model fits the original data: at x = 1, y = 1 + 3 + 1 = 5 ✓; at x = 2, y = 4 + 6 + 1 = 11 ✓.'
  },
  {
    id: 'sat-math-2',
    chapter: '6.1',
    type: 'Foundations',
    stem: 'A student fits an exponential model y = 5(2)^x to a set of data. What is the growth factor, and what does it mean in context?',
    choices: ['A) The growth factor is 5; the initial value doubles each period.', 'B) The growth factor is 2; the quantity doubles with each unit increase in x.', 'C) The growth factor is 10; the quantity increases by 10 each period.', 'D) The growth factor is 2; the quantity increases by 2 each period.'],
    correct: 1,
    explanation: 'In an exponential model y = a·b^x, the base b is the growth factor. Here b = 2, which means the quantity is multiplied by 2 (doubles) for each unit increase in x. The coefficient a = 5 is the initial value (when x = 0).'
  },
  {
    id: 'sat-math-3',
    chapter: '6.1',
    type: 'Foundations',
    stem: 'A linear regression on a data set yields y = 4.5x - 2.3 with r² = 0.64. A quadratic regression on the same data yields y = 0.8x² + 1.2x - 0.5 with r² = 0.95. Which model is more appropriate, and why?',
    choices: ['A) The linear model, because it is simpler.', 'B) The quadratic model, because it has a higher r² value, meaning it explains more of the variation in the data.', 'C) Both are equally appropriate since both have positive r² values.', 'D) Neither model is appropriate because the data should be modeled with an exponential function.'],
    correct: 1,
    explanation: 'The r² value indicates how well a model fits the data. The quadratic model\'s r² of 0.95 means it accounts for 95% of the variance, compared to only 64% for the linear model. A substantially higher r² indicates a better fit.'
  },
  {
    id: 'sat-math-4',
    chapter: '6.1',
    type: 'Foundations',
    stem: 'A graphing calculator produces the regression equation y = 120(0.85)^x for a set of data, where x is the number of years since 2020 and y is the value in thousands of dollars. What is the approximate value predicted by the model for the year 2023?',
    answer: '73.7',
    explanation: 'The year 2023 corresponds to x = 3. Substitute into the model: y = 120(0.85)³ = 120(0.614125) ≈ 73.7 thousand dollars. The key insight is that 0.85 raised to the third power gives approximately 0.614.'
  },

  // 6.2 — Desmos: Systems & Intersections
  {
    id: 'sat-math-5',
    chapter: '6.2',
    type: 'Foundations',
    stem: 'A student graphs y = x² - 2x - 3 and y = x + 1 on a graphing calculator. What are the x-coordinates of the intersection points?',
    choices: ['A) x = -1 and x = 4', 'B) x = -1 and x = 3', 'C) x = 1 and x = 3', 'D) x = -2 and x = 4'],
    correct: 0,
    explanation: 'Set the equations equal: x² - 2x - 3 = x + 1. Rearrange: x² - 3x - 4 = 0. Factor: (x - 4)(x + 1) = 0. So x = 4 or x = -1. You can verify: at x = -1, both equations give y = 0; at x = 4, y = x + 1 = 5 and y = 16 - 8 - 3 = 5. ✓'
  },
  {
    id: 'sat-math-6',
    chapter: '6.2',
    type: 'Foundations',
    stem: 'The system y = 2x + k and y = x² has exactly one solution. What is the value of k?',
    choices: ['A) -1', 'B) 0', 'C) 1', 'D) 2'],
    correct: 0,
    explanation: 'Set equal: x² = 2x + k, giving x² - 2x - k = 0. For exactly one solution, the discriminant must equal zero: (-2)² - 4(1)(-k) = 0 → 4 + 4k = 0 → k = -1. With k = -1, the equation becomes x² - 2x + 1 = 0, or (x - 1)² = 0, which has exactly one solution at x = 1.'
  },
  {
    id: 'sat-math-7',
    chapter: '6.2',
    type: 'Foundations',
    stem: 'A student uses a graphing calculator to graph y = √x and y = x - 2. How many intersection points do the graphs have?',
    choices: ['A) 0', 'B) 1', 'C) 2', 'D) 3'],
    correct: 1,
    explanation: 'Set √x = x - 2. Square both sides: x = (x - 2)² = x² - 4x + 4. Rearrange: x² - 5x + 4 = 0. Factor: (x - 1)(x - 4) = 0, so x = 1 or x = 4. Check x = 1: √1 = 1, but x - 2 = -1. Since 1 ≠ -1, x = 1 is extraneous. Check x = 4: √4 = 2 and x - 2 = 2. ✓. Only one valid intersection point.'
  },
  {
    id: 'sat-math-8',
    chapter: '6.2',
    type: 'Foundations',
    stem: 'A student graphs y = |x - 1| and y = ½x + 2 on a graphing calculator. At how many points do the two graphs intersect?',
    choices: ['A) 0', 'B) 1', 'C) 2', 'D) 3'],
    correct: 2,
    explanation: 'Case 1 (x ≥ 1): x - 1 = ½x + 2 → ½x = 3 → x = 6. Since 6 ≥ 1 ✓. Case 2 (x < 1): -(x - 1) = ½x + 2 → -x + 1 = ½x + 2 → -1 = (3/2)x → x = -2/3. Since -2/3 < 1 ✓. Both solutions are valid, so there are 2 intersection points.'
  },

  // ═══════════════════════════════════════════════
  //  Chapters 7.1–7.4: Heart of Algebra (20 questions)
  // ═══════════════════════════════════════════════

  // 7.1 — Linear Equations (7 questions)
  {
    id: 'sat-math-9',
    chapter: '7.1',
    type: 'Heart of Algebra',
    stem: 'A cell phone plan charges a flat fee of $25 per month plus $0.10 per text message. If a customer\'s bill for one month was $43, how many text messages did the customer send?',
    answer: '180',
    explanation: 'Set up the equation: 25 + 0.10t = 43. Subtract 25: 0.10t = 18. Divide by 0.10: t = 180 text messages. The flat fee is the y-intercept, and the per-text charge is the slope in this linear cost model.'
  },
  {
    id: 'sat-math-10',
    chapter: '7.1',
    type: 'Heart of Algebra',
    stem: 'The equation 5(2x - 3) - 4x = 3(x + 1) has what solution?',
    choices: ['A) x = 6', 'B) x = -6', 'C) x = 18', 'D) x = 3'],
    correct: 0,
    explanation: 'Distribute: 10x - 15 - 4x = 3x + 3. Combine like terms: 6x - 15 = 3x + 3. Subtract 3x: 3x - 15 = 3. Add 15: 3x = 18. Divide by 3: x = 6. Check: 5(2(6) - 3) - 4(6) = 5(9) - 24 = 45 - 24 = 21 and 3(6 + 1) = 3(7) = 21. ✓.'
  },
  {
    id: 'sat-math-11',
    chapter: '7.1',
    type: 'Heart of Algebra',
    stem: 'A line has a slope of -¾ and passes through the point (8, 2). What is the y-intercept of this line?',
    choices: ['A) -4', 'B) 4', 'C) 8', 'D) -8'],
    correct: 2,
    explanation: 'Use the slope-intercept form: y = mx + b. Substitute the point (8, 2) and slope m = -3/4: 2 = (-3/4)(8) + b → 2 = -6 + b → b = 8. The y-intercept is 8.'
  },
  {
    id: 'sat-math-12',
    chapter: '7.1',
    type: 'Heart of Algebra',
    stem: 'A tank contains 200 gallons of water and is being drained at a rate of 8 gallons per minute. Which equation models the amount of water w, in gallons, remaining in the tank after t minutes?',
    choices: ['A) w = 200 + 8t', 'B) w = 200 - 8t', 'C) w = 8t - 200', 'D) w = 200t - 8'],
    correct: 1,
    explanation: 'The tank starts with 200 gallons (initial value) and loses 8 gallons per minute (rate of change). Since the water is decreasing, the slope is negative: w = 200 - 8t. This is a linear model where 200 is the w-intercept and -8 is the slope.'
  },
  {
    id: 'sat-math-13',
    chapter: '7.1',
    type: 'Heart of Algebra',
    stem: 'If 2/3 x + 5 = 11, what is the value of x?',
    answer: '9',
    explanation: 'Subtract 5 from both sides: (2/3)x = 6. Multiply both sides by 3/2: x = 6 × (3/2) = 9. You can verify: (2/3)(9) + 5 = 6 + 5 = 11 ✓.'
  },
  {
    id: 'sat-math-14',
    chapter: '7.1',
    type: 'Heart of Algebra',
    stem: 'Line A passes through (0, 4) and (6, 0). Line B is perpendicular to Line A. What is the slope of Line B?',
    choices: ['A) -2/3', 'B) 2/3', 'C) 3/2', 'D) -3/2'],
    correct: 2,
    explanation: 'First find the slope of Line A: m_A = (0 - 4)/(6 - 0) = -4/6 = -2/3. Perpendicular lines have slopes that are negative reciprocals. The negative reciprocal of -2/3 is 3/2.'
  },
  {
    id: 'sat-math-15',
    chapter: '7.1',
    type: 'Heart of Algebra',
    stem: 'The equation 3(x + a) = 3x + 12 is true for all values of x. What is the value of a?',
    choices: ['A) 3', 'B) 4', 'C) 9', 'D) 12'],
    correct: 1,
    explanation: 'Distribute on the left: 3x + 3a = 3x + 12. For this to be true for all x, the constant terms must be equal: 3a = 12, so a = 4. This is an identity — the two sides are the same expression.'
  },

  // 7.2 — Systems of Linear Equations (5 questions)
  {
    id: 'sat-math-16',
    chapter: '7.2',
    type: 'Heart of Algebra',
    stem: 'A theater sold 400 tickets for a show. Adult tickets cost $12 and child tickets cost $7. If total revenue was $3,800, how many adult tickets were sold?',
    choices: ['A) 200', 'B) 240', 'C) 160', 'D) 280'],
    correct: 0,
    explanation: 'Let a = adult tickets, c = child tickets. System: a + c = 400 and 12a + 7c = 3800. From the first equation: c = 400 - a. Substitute: 12a + 7(400 - a) = 3800 → 12a + 2800 - 7a = 3800 → 5a = 1000 → a = 200. Verify: 200 adults + 200 children = 400 ✓. Revenue: 12(200) + 7(200) = 2400 + 1400 = 3800 ✓.'
  },
  {
    id: 'sat-math-17',
    chapter: '7.2',
    type: 'Heart of Algebra',
    stem: 'For what value of b does the system 3x + 6y = 15 and x + 2y = b have infinitely many solutions?',
    answer: '5',
    explanation: 'For infinitely many solutions, the equations must represent the same line. Divide the first equation by 3: x + 2y = 5. For the second equation to be identical, b must equal 5. When b = 5, both equations simplify to x + 2y = 5, meaning every point on this line is a solution.'
  },
  {
    id: 'sat-math-18',
    chapter: '7.2',
    type: 'Heart of Algebra',
    stem: 'The system of equations is: 2x + y = 10 and x - y = 2. What is the value of y?',
    choices: ['A) 2', 'B) 4', 'C) 6', 'D) 8'],
    correct: 0,
    explanation: 'Add the two equations: (2x + y) + (x - y) = 10 + 2, giving 3x = 12, so x = 4. Substitute back: 4 - y = 2, so y = 2. The elimination method works efficiently here because the y-terms cancel when you add.'
  },
  {
    id: 'sat-math-19',
    chapter: '7.2',
    type: 'Heart of Algebra',
    stem: 'A farmer buys a combination of chickens and goats. Chickens have 2 legs and goats have 4 legs. If the farmer counts 15 animals and 42 legs, how many goats does the farmer have?',
    choices: ['A) 5', 'B) 6', 'C) 7', 'D) 9'],
    correct: 1,
    explanation: 'Let c = chickens, g = goats. System: c + g = 15 and 2c + 4g = 42. From the first: c = 15 - g. Substitute: 2(15 - g) + 4g = 42 → 30 - 2g + 4g = 42 → 2g = 12 → g = 6. The farmer has 6 goats and 9 chickens. Check: 9(2) + 6(4) = 18 + 24 = 42 ✓.'
  },
  {
    id: 'sat-math-20',
    chapter: '7.2',
    type: 'Heart of Algebra',
    stem: 'If the system kx + 2y = 10 and 3x + 6y = 24 has no solution, what is the value of k?',
    choices: ['A) 1', 'B) 2', 'C) 3', 'D) 6'],
    correct: 0,
    explanation: 'For no solution, the lines must be parallel (same slope) but have different y-intercepts. Divide the second equation by 3: x + 2y = 8. The first equation is kx + 2y = 10. For the slopes to match, the coefficients of x and y must be proportional: k/1 = 2/2, so k = 1. When k = 1, the equations become x + 2y = 10 and x + 2y = 8. These have the same slope but different constants (10 ≠ 8), so they are parallel and the system has no solution.'
  },

  // 7.3 — Linear Inequalities (4 questions)
  {
    id: 'sat-math-21',
    chapter: '7.3',
    type: 'Heart of Algebra',
    stem: 'A shipping company charges $5 per package plus a $20 insurance fee. A customer has a budget of no more than $95 for shipping. What is the maximum number of packages the customer can ship?',
    choices: ['A) 13', 'B) 15', 'C) 17', 'D) 19'],
    correct: 1,
    explanation: 'Set up the inequality: 20 + 5p ≤ 95. Subtract 20: 5p ≤ 75. Divide by 5: p ≤ 15. The maximum number of packages is 15. This is a classic budget constraint problem where you subtract the fixed cost first, then divide by the variable cost.'
  },
  {
    id: 'sat-math-22',
    chapter: '7.3',
    type: 'Heart of Algebra',
    stem: 'Which of the following represents the solution set of -2x + 7 ≥ 3?',
    choices: ['A) x ≥ 2', 'B) x ≤ 2', 'C) x ≥ -2', 'D) x ≤ -2'],
    correct: 1,
    explanation: 'Subtract 7: -2x ≥ -4. Divide by -2 and flip the inequality sign (critical step when dividing by a negative): x ≤ 2. Remember: multiplying or dividing both sides of an inequality by a negative number reverses the direction of the inequality.'
  },
  {
    id: 'sat-math-23',
    chapter: '7.3',
    type: 'Heart of Algebra',
    stem: 'A student scores 82, 75, and 91 on three tests. What is the minimum score s the student must earn on the fourth test to have an average of at least 85?',
    answer: '92',
    explanation: 'Set up the inequality: (82 + 75 + 91 + s)/4 ≥ 85. Multiply by 4: 248 + s ≥ 340. Subtract 248: s ≥ 92. The minimum score needed is 92.'
  },
  {
    id: 'sat-math-24',
    chapter: '7.3',
    type: 'Heart of Algebra',
    stem: 'A store sells small candles for $4 and large candles for $9. A shopper wants to buy at least 6 candles and spend no more than $45. If the shopper buys s small candles and L large candles, which system of inequalities represents the constraints?',
    choices: [
      'A) s + L ≥ 6 and 4s + 9L ≤ 45',
      'B) s + L ≤ 6 and 4s + 9L ≤ 45',
      'C) s + L ≥ 6 and 4s + 9L ≥ 45',
      'D) s + L ≤ 6 and 4s + 9L ≥ 45'
    ],
    correct: 0,
    explanation: '"At least 6 candles" means s + L ≥ 6. "No more than $45" means 4s + 9L ≤ 45. Translating verbal constraints into mathematical inequalities requires careful attention to phrases like "at least" (≥) and "no more than" (≤).'
  },

  // 7.4 — Absolute Value (4 questions)
  {
    id: 'sat-math-25',
    chapter: '7.4',
    type: 'Heart of Algebra',
    stem: 'A machine fills bottles with a target volume of 500 mL. Quality control accepts bottles if the volume is within 3 mL of the target. Which inequality represents the acceptable volume v?',
    choices: ['A) |v - 500| > 3', 'B) |v - 500| ≤ 3', 'C) |v - 3| ≤ 500', 'D) |v + 500| ≤ 3'],
    correct: 1,
    explanation: 'The distance between the actual volume v and the target 500 must be at most 3 mL. The absolute value |v - 500| measures this distance, and "within 3 mL" means |v - 500| ≤ 3. This is equivalent to 497 ≤ v ≤ 503.'
  },
  {
    id: 'sat-math-26',
    chapter: '7.4',
    type: 'Heart of Algebra',
    stem: 'How many solutions does the equation |4x - 8| + 3 = 1 have?',
    choices: ['A) 0', 'B) 1', 'C) 2', 'D) Infinitely many'],
    correct: 0,
    explanation: 'Isolate the absolute value: |4x - 8| = 1 - 3 = -2. Since absolute value is always non-negative, |4x - 8| ≥ 0 for all x. The equation |4x - 8| = -2 has no solution.'
  },
  {
    id: 'sat-math-27',
    chapter: '7.4',
    type: 'Heart of Algebra',
    stem: 'What are the solutions to |3x + 6| = 15?',
    choices: ['A) x = 3 and x = -7', 'B) x = -3 and x = 7', 'C) x = 3 and x = -3', 'D) x = 7 and x = -7'],
    correct: 0,
    explanation: 'Set up two equations: 3x + 6 = 15 gives 3x = 9, so x = 3. And 3x + 6 = -15 gives 3x = -21, so x = -7. Always split an absolute value equation into positive and negative cases.'
  },
  {
    id: 'sat-math-28',
    chapter: '7.4',
    type: 'Heart of Algebra',
    stem: 'The graph of y = |x - 4| - 2 has its vertex at which point?',
    choices: ['A) (4, -2)', 'B) (-4, -2)', 'C) (4, 2)', 'D) (-4, 2)'],
    correct: 0,
    explanation: 'The general form y = |x - h| + k has its vertex at (h, k). Here h = 4 and k = -2, so the vertex is at (4, -2). The vertex of an absolute value function is the point where the expression inside the absolute value equals zero.'
  },

  // ═══════════════════════════════════════════════
  //  Chapters 8.1–8.4: Problem Solving & Data Analysis (12 questions)
  // ═══════════════════════════════════════════════

  // 8.1 — Percentages & Multiplier Method
  {
    id: 'sat-math-29',
    chapter: '8.1',
    type: 'Problem Solving & Data Analysis',
    stem: 'A laptop originally priced at $800 is on sale for 25% off. An employee then receives an additional 10% discount on the sale price. What is the employee\'s final price?',
    choices: ['A) $520', 'B) $540', 'C) $560', 'D) $580'],
    correct: 1,
    explanation: 'Apply the 25% discount first: $800 × 0.75 = $600. Then apply the 10% employee discount: $600 × 0.90 = $540. Note that successive percentage discounts are multiplied, not added: 25% + 10% ≠ 35% off. The combined multiplier is 0.75 × 0.90 = 0.675, giving $800 × 0.675 = $540.'
  },
  {
    id: 'sat-math-30',
    chapter: '8.1',
    type: 'Problem Solving & Data Analysis',
    stem: 'The population of a town was 12,000 in 2020. If the population increases by 4% each year, which expression gives the population y years after 2020?',
    choices: ['A) 12000 + 0.04y', 'B) 12000(0.04)^y', 'C) 12000(1.04)^y', 'D) 12000(4)^y'],
    correct: 2,
    explanation: 'A 4% annual increase means the population is multiplied by 1.04 each year. After y years: P = 12000(1.04)^y. This is exponential growth. The multiplier is 1 + (rate as decimal) = 1 + 0.04 = 1.04. Choice A describes linear growth, not exponential.'
  },
  {
    id: 'sat-math-31',
    chapter: '8.1',
    type: 'Problem Solving & Data Analysis',
    stem: 'A company\'s revenue increased from $2.5 million to $3.0 million. What was the percent increase?',
    answer: '20',
    explanation: 'Percent increase = (change / original) × 100 = (3.0 - 2.5)/2.5 × 100 = 0.5/2.5 × 100 = 20%. Always divide by the original (starting) value, not the new value.'
  },

  // 8.2 — Ratios, Rates & Proportions
  {
    id: 'sat-math-32',
    chapter: '8.2',
    type: 'Problem Solving & Data Analysis',
    stem: 'A painter can paint 3 rooms in 8 hours. At this rate, how many hours would it take to paint 12 rooms?',
    choices: ['A) 24', 'B) 28', 'C) 32', 'D) 36'],
    correct: 2,
    explanation: 'Set up a proportion: 3 rooms / 8 hours = 12 rooms / x hours. Cross-multiply: 3x = 96, so x = 32 hours. Alternatively, the rate is 3/8 rooms per hour, so time = 12 ÷ (3/8) = 12 × (8/3) = 32 hours.'
  },
  {
    id: 'sat-math-33',
    chapter: '8.2',
    type: 'Problem Solving & Data Analysis',
    stem: 'In a mixture of red and blue paint, the ratio of red to blue is 5:3. If 40 ounces of the mixture are made, how many ounces of blue paint are used?',
    answer: '15',
    explanation: 'Total ratio parts = 5 + 3 = 8. Blue paint = (3/8) × 40 = 15 ounces. In ratio problems, find total parts first, then determine each component\'s share.'
  },
  {
    id: 'sat-math-34',
    chapter: '8.2',
    type: 'Problem Solving & Data Analysis',
    stem: 'A train travels at a constant speed and covers 240 miles in 3 hours. A car leaves the same starting point at the same time and travels at 60 miles per hour. After 4 hours, how much farther has the train traveled than the car?',
    choices: ['A) 40 miles', 'B) 60 miles', 'C) 80 miles', 'D) 120 miles'],
    correct: 2,
    explanation: 'Train speed = 240/3 = 80 mph. After 4 hours: train travels 80 × 4 = 320 miles; car travels 60 × 4 = 240 miles. Difference = 320 - 240 = 80 miles.'
  },

  // 8.3 — Unit Conversions
  {
    id: 'sat-math-35',
    chapter: '8.3',
    type: 'Problem Solving & Data Analysis',
    stem: 'A factory produces 450 widgets per hour. How many widgets does it produce per minute?',
    choices: ['A) 7.5', 'B) 7,500', 'C) 27,000', 'D) 75'],
    correct: 0,
    explanation: '1 hour = 60 minutes. Divide: 450 widgets/hour ÷ 60 minutes/hour = 7.5 widgets per minute. When converting from a larger time unit to a smaller one, divide the quantity by the conversion factor.'
  },
  {
    id: 'sat-math-36',
    chapter: '8.3',
    type: 'Problem Solving & Data Analysis',
    stem: 'A recipe requires 2 cups of flour. If 1 cup = 236.6 mL, approximately how many liters of flour does the recipe require?',
    choices: ['A) 0.237 L', 'B) 0.473 L', 'C) 4.73 L', 'D) 47.3 L'],
    correct: 1,
    explanation: '2 cups × 236.6 mL/cup = 473.2 mL. Convert to liters: 473.2 mL ÷ 1000 mL/L = 0.4732 L ≈ 0.473 L. Chain unit conversions step by step to avoid errors.'
  },

  // 8.4 — Statistics: Mean/Median/SD
  {
    id: 'sat-math-37',
    chapter: '8.4',
    type: 'Problem Solving & Data Analysis',
    stem: 'A data set has values {4, 7, 10, 10, 13, 16, 21}. If the value 21 is removed, which measure of central tendency changes the most?',
    choices: ['A) Mean', 'B) Median', 'C) Mode', 'D) All change equally'],
    correct: 0,
    explanation: 'Original mean = (4+7+10+10+13+16+21)/7 = 81/7 ≈ 11.57. New mean = (4+7+10+10+13+16)/6 = 60/6 = 10. Change ≈ 1.57. Original median = 10, new median = 10. No change. Mode = 10 in both cases. The mean changes the most because it is sensitive to every value, especially outliers.'
  },
  {
    id: 'sat-math-38',
    chapter: '8.4',
    type: 'Problem Solving & Data Analysis',
    stem: 'A class of 20 students takes a quiz. The mean score is 78 and the median is 82. Which statement must be true?',
    choices: [
      'A) Most students scored above 78.',
      'B) The distribution of scores is skewed left (toward lower values).',
      'C) Exactly 10 students scored 82 or above.',
      'D) The highest score was 100.'
    ],
    correct: 1,
    explanation: 'When the mean is less than the median, the distribution is skewed left (negatively skewed). This means there are some low scores pulling the mean below the median. Choice C is close but says "exactly" 10 scored 82 or above — with 20 students, at least 10 scored at or above the median, but ties could change the exact count.'
  },
  {
    id: 'sat-math-39',
    chapter: '8.4',
    type: 'Problem Solving & Data Analysis',
    stem: 'The ages of 5 people are 22, 25, 28, 30, and 35. A sixth person of age a joins the group, and the mean age remains unchanged. What is the value of a?',
    answer: '28',
    explanation: 'Original mean = (22 + 25 + 28 + 30 + 35)/5 = 140/5 = 28. For the mean to stay at 28 with 6 people: (140 + a)/6 = 28 → 140 + a = 168 → a = 28. The new person must have an age equal to the current mean.'
  },
  {
    id: 'sat-math-40',
    chapter: '8.4',
    type: 'Problem Solving & Data Analysis',
    stem: 'In a survey, 300 people were asked about their preferred mode of transportation. The results were: car (45%), bus (25%), bicycle (18%), walking (12%). How many more people prefer cars than bicycles?',
    answer: '81',
    explanation: 'Car: 300 × 0.45 = 135 people. Bicycle: 300 × 0.18 = 54 people. Difference: 135 - 54 = 81 more people prefer cars than bicycles.'
  },

  // ═══════════════════════════════════════════════
  //  Chapters 9.1–9.4: Advanced Math (12 questions)
  // ═══════════════════════════════════════════════

  // 9.1 — Quadratics
  {
    id: 'sat-math-41',
    chapter: '9.1',
    type: 'Advanced Math',
    stem: 'The function f(x) = -2x² + 16x - 24 can be written in vertex form as f(x) = -2(x - h)² + k. What is the value of k?',
    choices: ['A) 4', 'B) 8', 'C) -8', 'D) -24'],
    correct: 1,
    explanation: 'Complete the square: f(x) = -2(x² - 8x) - 24 = -2(x² - 8x + 16 - 16) - 24 = -2(x - 4)² + 32 - 24 = -2(x - 4)² + 8. So h = 4 and k = 8. The vertex is (4, 8), and since a = -2 < 0, the parabola opens downward and k = 8 is the maximum value.'
  },
  {
    id: 'sat-math-42',
    chapter: '9.1',
    type: 'Advanced Math',
    stem: 'A projectile is launched from ground level and its height h (in meters) after t seconds is given by h(t) = -5t² + 30t. At what time does the projectile return to the ground?',
    choices: ['A) 3 seconds', 'B) 5 seconds', 'C) 6 seconds', 'D) 10 seconds'],
    correct: 2,
    explanation: 'Set h(t) = 0: -5t² + 30t = 0. Factor: -5t(t - 6) = 0. So t = 0 or t = 6. The projectile is on the ground at t = 0 (launch) and t = 6 (landing). It returns to ground level at t = 6 seconds.'
  },
  {
    id: 'sat-math-43',
    chapter: '9.1',
    type: 'Advanced Math',
    stem: 'If x² + 6x + c is a perfect square trinomial, what is the value of c?',
    answer: '9',
    explanation: 'A perfect square trinomial has the form (x + a)² = x² + 2ax + a². Comparing x² + 6x + c with x² + 2ax + a²: 2a = 6, so a = 3, and c = a² = 9. The trinomial x² + 6x + 9 = (x + 3)².'
  },

  // 9.2 — The Discriminant
  {
    id: 'sat-math-44',
    chapter: '9.2',
    type: 'Advanced Math',
    stem: 'The equation x² + bx + 16 = 0 has exactly one real solution. Which of the following could be the value of b?',
    choices: ['A) 4', 'B) -8', 'C) 12', 'D) -16'],
    correct: 1,
    explanation: 'For exactly one real solution, the discriminant must equal zero: b² - 4(1)(16) = 0 → b² = 64 → b = ±8. Among the choices, b = -8 works. When the discriminant is zero, the quadratic touches the x-axis at exactly one point (a repeated root).'
  },
  {
    id: 'sat-math-45',
    chapter: '9.2',
    type: 'Advanced Math',
    stem: 'The quadratic equation 3x² - 5x + k = 0 has two distinct real solutions. Which inequality must be true?',
    choices: ['A) k < 25/12', 'B) k > 25/12', 'C) k = 25/12', 'D) k < 0'],
    correct: 0,
    explanation: 'For two distinct real solutions, the discriminant must be positive: b² - 4ac > 0 → (-5)² - 4(3)(k) > 0 → 25 - 12k > 0 → k < 25/12. This means k must be less than 25/12 ≈ 2.083 for the parabola to cross the x-axis at two points.'
  },

  // 9.3 — Exponential Functions
  {
    id: 'sat-math-46',
    chapter: '9.3',
    type: 'Advanced Math',
    stem: 'A bank account earns 6% interest compounded annually. If $2,000 is deposited, which expression represents the balance after t years?',
    choices: ['A) 2000(1.6)^t', 'B) 2000 + 120t', 'C) 2000(1.06)^t', 'D) 2000(0.94)^t'],
    correct: 2,
    explanation: 'Compound interest formula: A = P(1 + r)^t. Here P = 2000 and r = 0.06, so A = 2000(1.06)^t. Choice B represents simple interest ($120/year), not compound interest. Choice D represents 6% decay, not growth.'
  },
  {
    id: 'sat-math-47',
    chapter: '9.3',
    type: 'Advanced Math',
    stem: 'The number of bacteria in a culture triples every 4 hours. If the culture starts with 200 bacteria, how many bacteria are present after 12 hours?',
    answer: '5400',
    explanation: 'The bacteria triple every 4 hours. After 12 hours, the number of tripling periods is 12/4 = 3. So the population = 200 × 3³ = 200 × 27 = 5,400. In general, N = 200(3)^(t/4), and at t = 12: N = 200(3)³ = 5400.'
  },
  {
    id: 'sat-math-48',
    chapter: '9.3',
    type: 'Advanced Math',
    stem: 'The value of a collectible is modeled by V(t) = 500(1.12)^t, where t is the number of years since purchase. By what percent does the value increase each year?',
    choices: ['A) 1.12%', 'B) 12%', 'C) 112%', 'D) 0.12%'],
    correct: 1,
    explanation: 'In the exponential model V = a(b)^t, the growth rate r satisfies b = 1 + r. Here b = 1.12, so r = 0.12 = 12%. The value increases by 12% each year. The base of the exponential tells you the multiplier; subtract 1 and convert to a percentage to find the rate.'
  },

  // 9.4 — Polynomials
  {
    id: 'sat-math-49',
    chapter: '9.4',
    type: 'Advanced Math',
    stem: 'If f(x) = x³ - 4x² + x + 6, what is f(2)?',
    choices: ['A) 0', 'B) 2', 'C) -4', 'D) 4'],
    correct: 0,
    explanation: 'Substitute x = 2: f(2) = (2)³ - 4(2)² + 2 + 6 = 8 - 16 + 2 + 6 = 0. Since f(2) = 0, we know that (x - 2) is a factor of the polynomial by the Factor Theorem.'
  },
  {
    id: 'sat-math-50',
    chapter: '9.4',
    type: 'Advanced Math',
    stem: 'Which expression is equivalent to (2x + 3)(x² - x + 4)?',
    choices: ['A) 2x³ + x² + 5x + 12', 'B) 2x³ - 2x² + 8x + 12', 'C) 2x³ + x² + 11x + 12', 'D) 2x³ + 5x² + 5x + 12'],
    correct: 0,
    explanation: 'Distribute: 2x(x² - x + 4) + 3(x² - x + 4) = 2x³ - 2x² + 8x + 3x² - 3x + 12. Combine like terms: -2x² + 3x² = x² and 8x - 3x = 5x. Result: 2x³ + x² + 5x + 12.'
  },
  {
    id: 'sat-math-51',
    chapter: '9.4',
    type: 'Advanced Math',
    stem: 'The polynomial p(x) = x³ + 3x² - 10x - 24 has x = -2 as a root. Which of the following is a complete factorization of p(x)?',
    choices: [
      'A) (x + 2)(x + 4)(x - 3)',
      'B) (x + 2)(x - 4)(x + 3)',
      'C) (x - 2)(x + 4)(x - 3)',
      'D) (x + 2)(x - 4)(x - 3)'
    ],
    correct: 0,
    explanation: 'Since x = -2 is a root, (x + 2) is a factor. Divide p(x) by (x + 2) using synthetic division with coefficients 1, 3, -10, -24 and root -2: the quotient is x² + x - 12. Factor x² + x - 12 = (x + 4)(x - 3). So p(x) = (x + 2)(x + 4)(x - 3). Verify: the roots are x = -2, -4, and 3.'
  },
  {
    id: 'sat-math-52',
    chapter: '9.4',
    type: 'Advanced Math',
    stem: 'What is the remainder when 2x³ + 5x² - 3x + 7 is divided by (x + 3)?',
    answer: '7',
    explanation: 'By the Remainder Theorem, the remainder equals f(-3). Substitute x = -3: 2(-3)³ + 5(-3)² - 3(-3) + 7 = 2(-27) + 5(9) + 9 + 7 = -54 + 45 + 9 + 7 = 7.'
  },

  // ═══════════════════════════════════════════════
  //  Chapters 10.1–10.4: Geometry & Trig (8 questions)
  // ═══════════════════════════════════════════════

  // 10.1 — Lines & Angles
  {
    id: 'sat-math-53',
    chapter: '10.1',
    type: 'Geometry & Trig',
    stem: 'In a figure, two parallel lines are cut by a transversal. One angle measures (3x + 10)° and the co-interior (same-side interior) angle measures (2x + 20)°. What is the value of x?',
    choices: ['A) 20', 'B) 30', 'C) 34', 'D) 40'],
    correct: 1,
    explanation: 'Co-interior angles (also called consecutive interior angles or same-side interior angles) are supplementary when formed by parallel lines and a transversal. So (3x + 10) + (2x + 20) = 180 → 5x + 30 = 180 → 5x = 150 → x = 30.'
  },
  {
    id: 'sat-math-54',
    chapter: '10.1',
    type: 'Geometry & Trig',
    stem: 'The sum of the interior angles of a polygon is 1080°. How many sides does the polygon have?',
    answer: '8',
    explanation: 'The sum of interior angles of an n-sided polygon is (n - 2) × 180°. Set up the equation: (n - 2) × 180 = 1080 → n - 2 = 6 → n = 8. The polygon is an octagon.'
  },

  // 10.2 — Triangles
  {
    id: 'sat-math-55',
    chapter: '10.2',
    type: 'Geometry & Trig',
    stem: 'In triangle DEF, angle D = 50° and angle E = 65°. What is the measure of the exterior angle at vertex F?',
    choices: ['A) 65°', 'B) 115°', 'C) 130°', 'D) 245°'],
    correct: 1,
    explanation: 'The exterior angle of a triangle equals the sum of the two non-adjacent interior angles. Exterior angle at F = angle D + angle E = 50° + 65° = 115°. Alternatively: angle F = 180° - 50° - 65° = 65°, and the exterior angle = 180° - 65° = 115°.'
  },
  {
    id: 'sat-math-56',
    chapter: '10.2',
    type: 'Geometry & Trig',
    stem: 'A 45-45-90 triangle has a hypotenuse of length 8√2. What is the length of each leg?',
    answer: '8',
    explanation: 'In a 45-45-90 triangle, the relationship between the legs and hypotenuse is: leg × √2 = hypotenuse. So each leg = hypotenuse / √2 = 8√2 / √2 = 8.'
  },

  // 10.3 — Trigonometry
  {
    id: 'sat-math-57',
    chapter: '10.3',
    type: 'Geometry & Trig',
    stem: 'From the top of a 120-foot building, the angle of depression to a car on the ground is 30°. How far is the car from the base of the building? (tan 30° ≈ 0.577)',
    choices: ['A) 60 feet', 'B) 120√3 feet', 'C) 69.3 feet', 'D) 207.8 feet'],
    correct: 3,
    explanation: 'The angle of depression from the top equals the angle of elevation from the car. Using tan(30°) = opposite/adjacent = 120/d, we get d = 120/tan(30°) = 120/0.577 ≈ 207.8 feet. Alternatively, since tan(30°) = 1/√3, d = 120√3 ≈ 120(1.732) = 207.8 feet.'
  },
  {
    id: 'sat-math-58',
    chapter: '10.3',
    type: 'Geometry & Trig',
    stem: 'In a right triangle, sin(A) = 7/25. What is cos(A)?',
    choices: ['A) 7/24', 'B) 24/25', 'C) 24/7', 'D) 25/24'],
    correct: 1,
    explanation: 'If sin(A) = opposite/hypotenuse = 7/25, then the opposite side is 7 and the hypotenuse is 25. Find the adjacent side using the Pythagorean theorem: adjacent = √(25² - 7²) = √(625 - 49) = √576 = 24. Therefore cos(A) = adjacent/hypotenuse = 24/25.'
  },

  // 10.4 — Circles
  {
    id: 'sat-math-59',
    chapter: '10.4',
    type: 'Geometry & Trig',
    stem: 'The equation x² + y² - 6x + 4y - 12 = 0 represents a circle. What is the radius of this circle?',
    choices: ['A) 3', 'B) 5', 'C) 12', 'D) 25'],
    correct: 1,
    explanation: 'Complete the square for both variables. Group: (x² - 6x) + (y² + 4y) = 12. Complete: (x² - 6x + 9) + (y² + 4y + 4) = 12 + 9 + 4. Result: (x - 3)² + (y + 2)² = 25. So the radius is √25 = 5, and the center is (3, -2).'
  },
  {
    id: 'sat-math-60',
    chapter: '10.4',
    type: 'Geometry & Trig',
    stem: 'A sector of a circle has a central angle of 120° and a radius of 9 cm. What is the area of the sector?',
    choices: ['A) 9π cm²', 'B) 27π cm²', 'C) 54π cm²', 'D) 81π cm²'],
    correct: 1,
    explanation: 'Area of a sector = (θ/360) × πr². Substitute: (120/360) × π(9)² = (1/3)(81π) = 27π cm². The sector is one-third of the full circle since 120° is one-third of 360°.'
  },
]
