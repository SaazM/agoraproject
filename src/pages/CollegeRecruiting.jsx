import { useState, useMemo, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { getInitialPreferredExam } from '../lib/examChoice.js'
import { getExamConfig, getScoreColumnsForExam } from '../data/examData.js'
import { getExamFromTestId, normalizeTestId, getTestsForExam } from '../data/tests.js'
import { getAnswerKeyBySection } from '../data/answerKeys.js'
import { scoreAttemptFromKey } from '../data/examData.js'
import {
  COLLEGES,
  computeAdmissionChance,
  getMatchTier,
  STATES,
  REGIONS,
  REGION_LABELS,
  SETTINGS,
  SIZE_LABELS,
  TAG_LABELS,
  ALL_TAGS,
  STATE_NAMES,
  MAJORS,
  getMajorsForCollege,
} from '../data/collegeData.js'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'

/* ── Application requirement labels ── */
const APP_PLATFORM_LABELS = {
  'common-app': 'Common App', 'coalition': 'Coalition App', 'uc-app': 'UC Application',
  'applytexas': 'ApplyTexas', 'direct': 'Direct Application', 'military': 'Direct (Military)',
   'questbridge': 'QuestBridge',
}
const TEST_POLICY_LABELS = {
  required: 'Required', optional: 'Test-Optional', blind: 'Test-Blind', free: 'Test-Free',
}
const INTERVIEW_LABELS = {
  required: 'Required', recommended: 'Recommended', optional: 'Optional (Alumni)',
  evaluative: 'Evaluative', none: 'Not Offered',
}

/* ── Rank tiers as numeric priority for sorting ── */
const RANK_TIER_ORDER = { top10: 1, top25: 2, top50: 3, top100: 4, top200: 5, other: 6 }

/* ── Cost filter presets ── */
const COST_PRESETS = [
  { label: 'Under $10k', max: 10000 },
  { label: '$10k–$25k', min: 10000, max: 25000 },
  { label: '$25k–$50k', min: 25000, max: 50000 },
  { label: '$50k+', min: 50000 },
]

/* ── Use the rank field from the database (falls back to array index) ── */
const COLLEGES_RANKED = COLLEGES.map((c, i) => ({ ...c, rank: c.rank || (i + 1) }))

const PAGE_SIZE = 50

function computeScoresFromAnswers(attempt) {
  try {
    const keyBySection = getAnswerKeyBySection(attempt?.test_id) || null
    if (!keyBySection) return null
    return scoreAttemptFromKey(attempt?.test_id, attempt?.answers || {}, keyBySection)
  } catch {
    return null
  }
}

function formatCost(amount) {
  if (amount === 0) return 'Free'
  if (amount >= 1000) return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`
  return `$${amount.toLocaleString()}`
}

function formatEnrollment(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return n.toLocaleString()
}

/* ── College domain derivation for logos ── */
const DOMAIN_OVERRIDES = {
  'Harvard University': 'harvard.edu',
  'Stanford University': 'stanford.edu',
  'Massachusetts Institute of Technology': 'mit.edu',
  'California Institute of Technology': 'caltech.edu',
  'Georgia Institute of Technology': 'gatech.edu',
  'United States Military Academy': 'westpoint.edu',
  'United States Naval Academy': 'usna.edu',
  'United States Air Force Academy': 'usafa.edu',
  'William & Mary': 'wm.edu',
  'University of California, Berkeley': 'berkeley.edu',
  'University of California, Los Angeles': 'ucla.edu',
  'University of California, San Diego': 'ucsd.edu',
  'University of California, Davis': 'ucdavis.edu',
  'University of California, Irvine': 'uci.edu',
  'University of California, Santa Barbara': 'ucsb.edu',
  'University of Southern California': 'usc.edu',
  'University of North Carolina at Chapel Hill': 'unc.edu',
  'University of Illinois Urbana-Champaign': 'illinois.edu',
  'University of Texas at Austin': 'utexas.edu',
  'University of Wisconsin-Madison': 'wisc.edu',
  'Washington University in St. Louis': 'wustl.edu',
  'Carnegie Mellon University': 'cmu.edu',
  'New York University': 'nyu.edu',
  'Boston College': 'bc.edu',
  'Brigham Young University': 'byu.edu',
  'Wake Forest University': 'wfu.edu',
  'Rhode Island School of Design': 'risd.edu',
  'School of the Art Institute of Chicago': 'saic.edu',
  'Case Western Reserve University': 'case.edu',
  'Rensselaer Polytechnic Institute': 'rpi.edu',
  'Worcester Polytechnic Institute': 'wpi.edu',
  'Stevens Institute of Technology': 'stevens.edu',
  'North Carolina A&T State University': 'ncat.edu',
  'Florida A&M University': 'famu.edu',
  'Texas A&M University': 'tamu.edu',
  'Penn State University': 'psu.edu',
  'Pennsylvania State University': 'psu.edu',
  'Ohio State University': 'osu.edu',
  'Michigan State University': 'msu.edu',
  'Arizona State University': 'asu.edu',
  'Iowa State University': 'iastate.edu',
  'Colorado State University': 'colostate.edu',
  'San Diego State University': 'sdsu.edu',
  'Florida State University': 'fsu.edu',
  'North Carolina State University': 'ncsu.edu',

  // ── Major schools where auto-derivation fails (first half of COLLEGES array) ──
  'University of Pennsylvania': 'upenn.edu',
  'Johns Hopkins University': 'jhu.edu',
  'University of Chicago': 'uchicago.edu',
  'University of Notre Dame': 'nd.edu',
  'University of Florida': 'ufl.edu',
  'University of Georgia': 'uga.edu',
  'Boston University': 'bu.edu',
  'University of Pittsburgh': 'pitt.edu',
  'Santa Clara University': 'scu.edu',
  'University of Connecticut': 'uconn.edu',
  'George Washington University': 'gwu.edu',
  'University of Iowa': 'uiowa.edu',
  'University of Colorado Boulder': 'colorado.edu',
  'University of Delaware': 'udel.edu',
  'University of Oregon': 'uoregon.edu',
  'University of Alabama': 'ua.edu',
  'University of Oklahoma': 'ou.edu',
  'University of Kansas': 'ku.edu',
  'University of Kentucky': 'uky.edu',
  'University of Mississippi': 'olemiss.edu',
  'University of Arkansas': 'uark.edu',
  'University of Nebraska-Lincoln': 'unl.edu',
  'University of Missouri': 'missouri.edu',
  'University of Denver': 'du.edu',
  'University of Tulsa': 'utulsa.edu',
  'University of San Diego': 'sandiego.edu',
  'University of San Francisco': 'usfca.edu',
  'University of Dayton': 'udayton.edu',
  'Loyola University Chicago': 'luc.edu',
  'Yeshiva University': 'yu.edu',
  'Harvey Mudd College': 'hmc.edu',
  'Washington and Lee University': 'wlu.edu',
  'Colorado College': 'coloradocollege.edu',
  'Occidental College': 'oxy.edu',
  'Scripps College': 'scrippscollege.edu',
  'Trinity College': 'trincoll.edu',
  'Connecticut College': 'conncoll.edu',
  'Cooper Union': 'cooper.edu',
  'Hampton University': 'hamptonu.edu',
  'Clark University': 'clarku.edu',
  'Seton Hall University': 'shu.edu',
  'Duquesne University': 'duq.edu',
  'Valparaiso University': 'valpo.edu',
  'Mississippi State University': 'msstate.edu',
  'Kalamazoo College': 'kzoo.edu',
  'Rose-Hulman Institute of Technology': 'rose-hulman.edu',
  'Franklin & Marshall College': 'fandm.edu',
  'University of South Carolina': 'sc.edu',
  'Parsons School of Design': 'newschool.edu',
  'New College of Florida': 'ncf.edu',
  'Loyola University Maryland': 'loyola.edu',
  'St. Lawrence University': 'stlawu.edu',

  // ── University of X / X State / directional / A&M / CSU / UW / Penn State / Texas / SUNY / IU / UNC systems ──
  'Texas Christian University': 'tcu.edu',
  'University of Maine': 'umaine.edu',
  'Louisiana State University': 'lsu.edu',
  'Sarah Lawrence College': 'sarahlawrence.edu',
  'University of New Mexico': 'unm.edu',
  'University of Rhode Island': 'uri.edu',
  'University of Nevada, Reno': 'unr.edu',
  'College of Wooster': 'wooster.edu',
  'New Mexico Institute of Mining and Technology': 'nmt.edu',
  'Binghamton University': 'binghamton.edu',
  'University at Buffalo': 'buffalo.edu',
  'University at Albany': 'albany.edu',
  'SUNY College at Geneseo': 'geneseo.edu',
  'SUNY College at Oswego': 'oswego.edu',
  'California State University, Fullerton': 'fullerton.edu',
  'California State University, Long Beach': 'csulb.edu',
  'San Jose State University': 'sjsu.edu',
  'California State University, Sacramento': 'csus.edu',
  'California State Polytechnic University, Pomona': 'cpp.edu',
  'California State University, Northridge': 'csun.edu',
  'California State University, Fresno': 'fresnostate.edu',
  'California State University, San Bernardino': 'csusb.edu',
  'Ball State University': 'bsu.edu',
  'Bowling Green State University': 'bgsu.edu',
  'Western Michigan University': 'wmich.edu',
  'Eastern Michigan University': 'emich.edu',
  'Central Michigan University': 'cmich.edu',
  'Kent State University': 'kent.edu',
  'Ohio University': 'ohio.edu',

  // ── HBCUs ──
  'Tuskegee University': 'tuskegee.edu',
  'Xavier University of Louisiana': 'xula.edu',
  'Clark Atlanta University': 'cau.edu',
  'Bethune-Cookman University': 'cookman.edu',
  'Morgan State University': 'morgan.edu',
  'Norfolk State University': 'nsu.edu',
  'Delaware State University': 'desu.edu',
  'Southern University and A&M College': 'subr.edu',
  'Tennessee State University': 'tnstate.edu',
  'Prairie View A&M University': 'pvamu.edu',

  // ── Southeast regionals ──
  'Appalachian State University': 'appstate.edu',
  'Western Carolina University': 'wcu.edu',
  'East Carolina University': 'ecu.edu',
  'University of North Carolina at Charlotte': 'charlotte.edu',
  'University of North Carolina at Greensboro': 'uncg.edu',
  'University of North Carolina Wilmington': 'uncw.edu',
  'Coastal Carolina University': 'coastal.edu',
  'Georgia Southern University': 'georgiasouthern.edu',
  'Kennesaw State University': 'kennesaw.edu',
  'Valdosta State University': 'valdosta.edu',
  'University of South Alabama': 'southalabama.edu',
  'Troy University': 'troy.edu',
  'University of Alabama at Birmingham': 'uab.edu',
  'University of Alabama in Huntsville': 'uah.edu',
  'Jacksonville State University': 'jsu.edu',
  'Murray State University': 'murraystate.edu',
  'Western Kentucky University': 'wku.edu',
  'Eastern Kentucky University': 'eku.edu',
  'Northern Kentucky University': 'nku.edu',
  'Middle Tennessee State University': 'mtsu.edu',
  'University of Memphis': 'memphis.edu',
  'Austin Peay State University': 'apsu.edu',
  'University of Southern Mississippi': 'usm.edu',
  'Florida International University': 'fiu.edu',
  'Florida Atlantic University': 'fau.edu',
  'University of North Florida': 'unf.edu',
  'University of West Florida': 'uwf.edu',
  'Florida Gulf Coast University': 'fgcu.edu',
  'Old Dominion University': 'odu.edu',
  'Towson University': 'towson.edu',
  'Salisbury University': 'salisbury.edu',
  'Frostburg State University': 'frostburg.edu',

  // ── Northeast regionals ──
  'West Chester University': 'wcupa.edu',
  'Indiana University of Pennsylvania': 'iup.edu',
  'Slippery Rock University': 'sru.edu',
  'Kutztown University': 'kutztown.edu',
  'Millersville University': 'millersville.edu',
  'The College of New Jersey': 'tcnj.edu',
  'Rowan University': 'rowan.edu',
  'Sacred Heart University': 'sacredheart.edu',
  'University of Hartford': 'hartford.edu',
  'Bryant University': 'bryant.edu',
  'Assumption University': 'assumption.edu',
  'Merrimack College': 'merrimack.edu',
  'Stonehill College': 'stonehill.edu',
  'Endicott College': 'endicott.edu',
  'University of Scranton': 'scranton.edu',
  'La Salle University': 'lasalle.edu',
  "Saint Joseph's University": 'sju.edu',

  // ── Midwest regionals ──
  'University of St. Thomas': 'stthomas.edu',
  'Gustavus Adolphus College': 'gustavus.edu',
  "College of Saint Benedict / Saint John's University": 'csbsju.edu',
  'University of Northern Iowa': 'uni.edu',
  'University of Evansville': 'evansville.edu',
  'University of Indianapolis': 'uindy.edu',
  'Transylvania University': 'transy.edu',
  'John Carroll University': 'jcu.edu',
  'Ohio Wesleyan University': 'owu.edu',
  'Oklahoma State University': 'okstate.edu',
  'University of Central Oklahoma': 'uco.edu',
  'Wichita State University': 'wichita.edu',
  'Kansas State University': 'k-state.edu',
  'Emporia State University': 'emporia.edu',
  'Missouri State University': 'missouristate.edu',
  'Southeast Missouri State University': 'semo.edu',
  'University of Missouri-Kansas City': 'umkc.edu',
  'University of Nebraska at Omaha': 'unomaha.edu',
  'Minnesota State University, Mankato': 'mnsu.edu',
  'St. Cloud State University': 'stcloudstate.edu',
  'Winona State University': 'winona.edu',
  'University of Wisconsin-Milwaukee': 'uwm.edu',
  'University of Wisconsin-Eau Claire': 'uwec.edu',
  'University of Wisconsin-La Crosse': 'uwlax.edu',
  'University of Wisconsin-Oshkosh': 'uwosh.edu',
  'Lawrence University': 'lawrence.edu',
  'Northern Illinois University': 'niu.edu',
  'Southern Illinois University Carbondale': 'siu.edu',
  'Eastern Illinois University': 'eiu.edu',
  'Western Illinois University': 'wiu.edu',
  'Illinois State University': 'illinoisstate.edu',
  'Lake Forest College': 'lakeforest.edu',
  'Illinois Wesleyan University': 'iwu.edu',
  'North Central College': 'northcentralcollege.edu',

  // ── Southeast / Florida / Virginia ──
  'Mercer University': 'mercer.edu',
  'University of Tampa': 'ut.edu',
  'Loyola University New Orleans': 'loyno.edu',
  'Spring Hill College': 'shc.edu',
  'Lipscomb University': 'lipscomb.edu',
  'Presbyterian College': 'presby.edu',
  'Shenandoah University': 'su.edu',
  'Roanoke College': 'roanoke.edu',
  'Randolph-Macon College': 'rmc.edu',
  'Hampden-Sydney College': 'hsc.edu',

  // ── West regionals ──
  'University of Portland': 'up.edu',
  'Lewis & Clark College': 'lclark.edu',
  'Pacific University': 'pacificu.edu',
  'Seattle Pacific University': 'spu.edu',
  "Saint Martin's University": 'stmartin.edu',
  'Carroll College': 'carroll.edu',
  'Rocky Mountain College': 'rocky.edu',
  'University of Great Falls': 'uprovidence.edu',
  'Westminster College': 'westminsteru.edu',
  'Utah State University': 'usu.edu',
  'Weber State University': 'weber.edu',
  'Southern Utah University': 'suu.edu',
  'Colorado Mesa University': 'coloradomesa.edu',
  'Adams State University': 'adams.edu',
  'Fort Lewis College': 'fortlewis.edu',
  'Regis University': 'regis.edu',
  'University of Redlands': 'redlands.edu',
  'University of the Pacific': 'pacific.edu',
  'Whittier College': 'whittier.edu',
  'Mills College at Northeastern University': 'mills.edu',
  'Azusa Pacific University': 'apu.edu',
  'Point Loma Nazarene University': 'pointloma.edu',
  'California Baptist University': 'calbaptist.edu',

  // ── Texas / Southwest ──
  'University of Texas at El Paso': 'utep.edu',
  'University of Texas at San Antonio': 'utsa.edu',
  'University of Texas at Arlington': 'uta.edu',
  'Texas State University': 'txstate.edu',
  'Sam Houston State University': 'shsu.edu',
  'Stephen F. Austin State University': 'sfasu.edu',
  'Lamar University': 'lamar.edu',

  // ── West state schools ──
  'Montana State University': 'montana.edu',
  'North Dakota State University': 'ndsu.edu',
  'South Dakota State University': 'sdstate.edu',
  'Idaho State University': 'isu.edu',
  'Boise State University': 'boisestate.edu',
  'University of Nevada, Las Vegas': 'unlv.edu',
  'Portland State University': 'pdx.edu',
  'Western Oregon University': 'wou.edu',
  'Eastern Washington University': 'ewu.edu',
  'Northern Arizona University': 'nau.edu',
  'University of Northern Colorado': 'unco.edu',
  'New Mexico State University': 'nmsu.edu',
  'University of Alaska Fairbanks': 'uaf.edu',
  'University of Alaska Anchorage': 'uaa.edu',

  // ── Schools with unusual names or alias derivation failures ──
  'Liberty University': 'liberty.edu',
  'Oral Roberts University': 'oru.edu',
  'Kettering University': 'kettering.edu',
  'Grambling State University': 'gram.edu',
  'LeTourneau University': 'letu.edu',
  'Alcorn State University': 'alcorn.edu',
  'University of North Dakota': 'und.edu',
  'Alabama A&M University': 'aamu.edu',
  'California State University-Stanislaus': 'csustan.edu',
  'University of Wisconsin-Stevens Point': 'uwsp.edu',
  'University of Wisconsin-Stout': 'uwstout.edu',
  'University of Central Missouri': 'ucmo.edu',
  'California State University-Bakersfield': 'csub.edu',
  'Tarleton State University': 'tarleton.edu',
  'University of Wisconsin-Platteville': 'uwplatt.edu',
  'University of Montevallo': 'montevallo.edu',
  'Saginaw Valley State University': 'svsu.edu',
  'Ferris State University': 'ferris.edu',
  'University of Minnesota-Duluth': 'd.umn.edu',
  'University of North Carolina at Pembroke': 'uncp.edu',
  'California State University-Dominguez Hills': 'csudh.edu',
  'Youngstown State University': 'ysu.edu',
  'Texas A&M University-Kingsville': 'tamuk.edu',
  'Jackson State University': 'jsums.edu',
  'Henderson State University': 'hsu.edu',
  'Bowie State University': 'bowiestate.edu',
  'South Carolina State University': 'scsu.edu',
  'Northwest Missouri State University': 'nwmissouri.edu',
  'Fort Hays State University': 'fhsu.edu',
  'Indiana State University': 'indstate.edu',
  'University of Texas at Tyler': 'uttyler.edu',
  'Pittsburg State University': 'pittstate.edu',
  'Texas Southern University': 'tsu.edu',
  'Northern Michigan University': 'nmu.edu',
  'University of Arkansas at Little Rock': 'ualr.edu',
  'Indiana University-Purdue University Indianapolis': 'iupui.edu',
  'Texas A&M University-Commerce': 'tamuc.edu',
  'University of Nebraska at Kearney': 'unk.edu',
  'West Chester University of Pennsylvania': 'wcupa.edu',
  'Southern Arkansas University': 'saumag.edu',
  'University of Wisconsin-Green Bay': 'uwgb.edu',
  'Angelo State University': 'angelo.edu',
  'Coppin State University': 'coppin.edu',
  'Kutztown University of Pennsylvania': 'kutztown.edu',
  'University of Wisconsin-Parkside': 'uwp.edu',
  'Mississippi Valley State University': 'mvsu.edu',
  'Central Washington University': 'cwu.edu',
  'University of Hawaii at Hilo': 'hilo.hawaii.edu',
  'University of Wisconsin-Superior': 'uwsuper.edu',
  'Columbus State University': 'columbusstate.edu',
  'Nicholls State University': 'nicholls.edu',
  'Lincoln University': 'lincolnu.edu',
  'Bloomsburg University of Pennsylvania': 'bloomu.edu',
  'University of Central Arkansas': 'uca.edu',
  'Southern Connecticut State University': 'southernct.edu',
  'Savannah State University': 'savannahstate.edu',
  'University of Southern Indiana': 'usi.edu',
  'Southeastern Louisiana University': 'southeastern.edu',
  'University of North Carolina at Asheville': 'unca.edu',
  'Millersville University of Pennsylvania': 'millersville.edu',
  'University of Wisconsin-River Falls': 'uwrf.edu',
  'North Carolina Central University': 'nccu.edu',
  'California State University-Los Angeles': 'calstatela.edu',
  'Lock Haven University of Pennsylvania': 'lockhaven.edu',
  'Minot State University': 'minotstateu.edu',
  'Elizabeth City State University': 'ecsu.edu',
  'McNeese State University': 'mcneese.edu',
  'Northwest Nazarene University': 'nnu.edu',
  'Southeastern Oklahoma State University': 'se.edu',
  'University of West Georgia': 'westga.edu',
  'Eastern Oregon University': 'eou.edu',
  'California State University-East Bay': 'csueastbay.edu',
  'University of Mary Hardin-Baylor': 'umhb.edu',
  'Shepherd University': 'shepherd.edu',
  'Bemidji State University': 'bemidjistate.edu',
  'University of Maine at Farmington': 'umf.maine.edu',
  'Northwestern State University of Louisiana': 'nsula.edu',
  'Southern Nazarene University': 'snu.edu',
  'University of North Alabama': 'una.edu',
  'Oklahoma Christian University': 'oc.edu',
  'Winston-Salem State University': 'wssu.edu',
  'Southeastern University': 'seu.edu',
  'Wayne State College': 'wsc.edu',
  'Francis Marion University': 'fmarion.edu',
  'University of Guam': 'uog.edu',
  'Delta State University': 'deltastate.edu',
  'New Mexico Highlands University': 'nmhu.edu',
  'Tennessee Technological University': 'tntech.edu',
  'University of Houston-Downtown': 'uhd.edu',
  'Huston-Tillotson University': 'htu.edu',
  'Western New Mexico University': 'wnmu.edu',
  'Mount Vernon Nazarene University': 'mvnu.edu',
  'Clarion University of Pennsylvania': 'clarion.edu',
  'Fort Valley State University': 'fvsu.edu',
  'University of Maine at Presque Isle': 'umpi.edu',
  'Alabama State University': 'alasu.edu',
  'Bridgewater State University': 'bridgew.edu',
  'Arkansas State University': 'astate.edu',
  'Southern Oregon University': 'sou.edu',
  'Lake Superior State University': 'lssu.edu',
  'Fayetteville State University': 'uncfsu.edu',
  'Peru State College': 'peru.edu',
  'Missouri Western State University': 'missouriwestern.edu',
  'Eastern Connecticut State University': 'easternct.edu',
  'University of Mary': 'umary.edu',
  'Oregon Institute of Technology': 'oit.edu',
  'Indiana University-Southeast': 'ius.edu',
  'Plymouth State University': 'plymouth.edu',
  'University of Houston-Clear Lake': 'uhcl.edu',
  'Bluefield State University': 'bluefieldstate.edu',
  'West Texas A&M University': 'wtamu.edu',
  'Fitchburg State University': 'fitchburgstate.edu',
  'Utah Tech University': 'utahtech.edu',
  'Chadron State College': 'csc.edu',
  'Kentucky State University': 'kysu.edu',
  'Northwestern Oklahoma State University': 'nwosu.edu',
  'Mansfield University of Pennsylvania': 'mansfield.edu',
  'Trevecca Nazarene University': 'trevecca.edu',
  'Southern West Virginia Community and Technical College': 'southernwv.edu',
  'Cheyney University of Pennsylvania': 'cheyney.edu',
  'Northern State University': 'northern.edu',
  'Midwestern State University': 'msutexas.edu',
  'California State University-Monterey Bay': 'csumb.edu',
  'Central State University': 'centralstate.edu',
  'Black Hills State University': 'bhsu.edu',
  'Western Connecticut State University': 'wcsu.edu',
  'University of Virgin Islands': 'uvi.edu',
  'Dickinson State University': 'dickinsonstate.edu',
  'Oklahoma Panhandle State University': 'opsu.edu',
  'University of Maine at Machias': 'machias.edu',
  'Southern University at New Orleans': 'suno.edu',
  'Valley City State University': 'vcsu.edu',
  'West Virginia State University': 'wvstateu.edu',
  'Indiana University-Kokomo': 'iuk.edu',
  'Mayville State University': 'mayvillestate.edu',
  'Montana State University-Billings': 'msubillings.edu',
  'University of Arkansas at Pine Bluff': 'uapb.edu',
  'Keene State College': 'keene.edu',
  'Cameron University': 'cameron.edu',
  'University of Houston-Victoria': 'uhv.edu',
  'Castleton University': 'castleton.edu',
  'Louisiana College': 'lacollege.edu',
  'Great Basin College': 'gbcnv.edu',
  'Glenville State University': 'glenville.edu',
  'University of Arkansas at Monticello': 'uamont.edu',
  'Rhode Island College': 'ric.edu',
  'Harris-Stowe State University': 'hssu.edu',
  'Montana State University-Northern': 'msun.edu',
  'Dalton State College': 'daltonstate.edu',
  'University of Science and Arts of Oklahoma': 'usao.edu',
  'Worcester State University': 'worcester.edu',
  'South Dakota School of Mines and Technology': 'sdsmt.edu',
  'Fairmont State University': 'fairmontstate.edu',
  'Philander Smith University': 'philander.edu',
  'Shawnee State University': 'shawnee.edu',
  'Virginia State University': 'vsu.edu',
  'Lewis-Clark State College': 'lcsc.edu',
  'Palm Beach Atlantic University': 'pba.edu',
  'University of Montana-Western': 'umwestern.edu',
  'Salish Kootenai College': 'skc.edu',
  'East Central University': 'ecok.edu',
  'Framingham State University': 'framingham.edu',
  'University of Arkansas-Fort Smith': 'uafs.edu',
  'Salem State University': 'salemstate.edu',
  'Lincoln Memorial University': 'lmunet.edu',
  'Paul Quinn College': 'pqc.edu',
  'Westfield State University': 'westfield.ma.edu',
  'Northern Vermont University': 'northernvermont.edu',
  'Western Colorado University': 'western.edu',
  'Jarvis Christian University': 'jarvis.edu',
  'University of Pikeville': 'upike.edu',
  'Albany State University': 'asurams.edu',
  'Indiana University East': 'iue.edu',
  'Penn State Berks': 'bk.psu.edu',
  'Penn State Hazleton': 'hazleton.psu.edu',
  'Texas A&M International University': 'tamiu.edu',
  'University of Puerto Rico - Mayaguez': 'uprm.edu',
  'Penn State Schuylkill': 'schuylkill.psu.edu',
  'Indiana University Northwest': 'iun.edu',
  'Penn State Brandywine': 'brandywine.psu.edu',
  'University of Puerto Rico - Rio Piedras': 'uprrp.edu',
  'Indiana University South Bend': 'iusb.edu',
  'University of Alaska Southeast': 'uas.alaska.edu',
  'Dakota State University': 'dsu.edu',
  'Penn State York': 'york.psu.edu',
  'Penn State New Kensington': 'nk.psu.edu',
  'University of the District of Columbia': 'udc.edu',
  'Penn State Lehigh Valley': 'lv.psu.edu',
  'Eastern New Mexico University': 'enmu.edu',
  'Penn State Mont Alto': 'ma.psu.edu',
  'Sul Ross State University': 'sulross.edu',
  'Southern University at Shreveport': 'susla.edu',
  'Penn State Beaver': 'beaver.psu.edu',
  'University of Maine at Fort Kent': 'umfk.edu',
  'Penn State DuBois': 'dubois.psu.edu',
  'Texas A&M University-Texarkana': 'tamut.edu',
  'Penn State Fayette': 'fayette.psu.edu',
  'University of Hawaii - West Oahu': 'uhwo.hawaii.edu',
  'Northern New Mexico College': 'nnmc.edu',
  'Penn State Shenango': 'shenango.psu.edu',

  // ── Smaller privates / religious / HBCUs (second half) ──
  'Dillard University': 'dillard.edu',
  'Oklahoma Baptist University': 'okbu.edu',
  'Lees-McRae College': 'lmc.edu',
  'University of the Cumberlands': 'ucumberlands.edu',
  'William Penn University': 'wmpenn.edu',
  'Briar Cliff University': 'briarcliff.edu',
  'University of Providence': 'uprovidence.edu',
  'Bethel College': 'bethelks.edu',
  'Concordia University Nebraska': 'cune.edu',
  'Lincoln Christian University': 'lincolnchristian.edu',
  'Nebraska Wesleyan University': 'nebrwesleyan.edu',
  'Columbia College': 'ccis.edu',
  'Lindenwood University': 'lindenwood.edu',
  'MidAmerica Nazarene University': 'mnu.edu',
  'Ouachita Baptist University': 'obu.edu',
  'John Brown University': 'jbu.edu',
  "University of Virginia's College at Wise": 'uvawise.edu',
  'Rogers State University': 'rsu.edu',
  'Northeastern State University': 'nsuok.edu',
  'University of South Carolina Beaufort': 'uscb.edu',
  'Missouri Southern State University': 'mssu.edu',
  'University of South Carolina Upstate': 'uscupstate.edu',
  'Edinboro University of Pennsylvania': 'edinboro.edu',
  'Haskell Indian Nations University': 'haskell.edu',
  'Thomas More University': 'thomasmore.edu',
  'Freed-Hardeman University': 'fhu.edu',
  'William Carey University': 'wmcarey.edu',
  'Blue Mountain Christian University': 'bmc.edu',
  'Mid-America Christian University': 'macu.edu',
  'University of the Ozarks': 'ozarks.edu',
  'College of the Ozarks': 'cofo.edu',
  'Edward Waters University': 'ewu.edu',
  'Florida Memorial University': 'fmuniv.edu',
  'Central Methodist University': 'centralmethodist.edu',
  'Southwestern Oklahoma State University': 'swosu.edu',
  'University of Maine at Augusta': 'uma.edu',
  'Culver-Stockton College': 'culver.edu',
  "St. Augustine's University": 'st-aug.edu',
  'Central Christian College of Kansas': 'centralchristian.edu',
  'Southwestern Christian University': 'swcu.edu',
  'Southwestern Assemblies of God University': 'sagu.edu',
  'University of the Southwest': 'usw.edu',
  'Kansas Wesleyan University': 'kwu.edu',
  'Emory & Henry College': 'ehc.edu',
  'Eastern Mennonite University': 'emu.edu',
  'University of Lynchburg': 'lynchburg.edu',
  'Chaminade University of Honolulu': 'chaminade.edu',
  'Hawaii Pacific University': 'hpu.edu',
  'Alaska Pacific University': 'alaskapacific.edu',
  'University of Wyoming': 'uwyo.edu',
  'University of Montana': 'umt.edu',
  'Virginia Military Institute': 'vmi.edu',
  'Truman State University': 'truman.edu',
  'Suffolk University': 'suffolk.edu',
  'Berea College': 'berea.edu',
  'Evergreen State College': 'evergreen.edu',
  'University of Minnesota Morris': 'morris.umn.edu',
  'Southwest Minnesota State University': 'smsu.edu',
  'University of Puerto Rico - Bayamon': 'uprb.edu',
  'Seton Hill University': 'setonhill.edu',
  'Point Park University': 'pointpark.edu',
  'La Roche University': 'laroche.edu',
  'George Fox University': 'georgefox.edu',

  // ── Military & performing arts ──
  'United States Coast Guard Academy': 'uscga.edu',
  'United States Merchant Marine Academy': 'usmma.edu',
  'The Citadel': 'citadel.edu',
  'Norwich University': 'norwich.edu',
  'The Juilliard School': 'juilliard.edu',
  'Curtis Institute of Music': 'curtis.edu',
  'California Institute of the Arts': 'calarts.edu',

  // ── Art schools ──
  'Berklee College of Music': 'berklee.edu',
  'School of Visual Arts': 'sva.edu',
  'Savannah College of Art and Design': 'scad.edu',
  'Ringling College of Art and Design': 'ringling.edu',
  'California College of the Arts': 'cca.edu',
  'Otis College of Art and Design': 'otis.edu',
  'Pacific Northwest College of Art': 'pnca.edu',

  'Princeton University': 'princeton.edu',
  'Yale University': 'yale.edu',
  'Duke University': 'duke.edu',
  'Northwestern University': 'northwestern.edu',
  'Columbia University': 'columbia.edu',
  'Cornell University': 'cornell.edu',
  'Brown University': 'brown.edu',
  'Dartmouth College': 'dartmouth.edu',
  'Vanderbilt University': 'vanderbilt.edu',
  'Rice University': 'rice.edu',
  'Georgetown University': 'georgetown.edu',
  'Emory University': 'emory.edu',
  'University of Virginia': 'virginia.edu',
  'University of Michigan, Ann Arbor': 'umich.edu',
  'Tufts University': 'tufts.edu',
  'University of Rochester': 'rochester.edu',
  'Brandeis University': 'brandeis.edu',
  'Lehigh University': 'lehigh.edu',
  'Northeastern University': 'northeastern.edu',
  'Tulane University': 'tulane.edu',
  'Pepperdine University': 'pepperdine.edu',
  'Villanova University': 'villanova.edu',
  'Purdue University': 'purdue.edu',
  'University of Maryland, College Park': 'umd.edu',
  'University of Washington': 'washington.edu',
  'Rutgers University-New Brunswick': 'rutgers.edu',
  'University of Miami': 'miami.edu',
  'Virginia Tech': 'vt.edu',
  'University of Minnesota Twin Cities': 'umn.edu',
  'Fordham University': 'fordham.edu',
  'Southern Methodist University': 'smu.edu',
  'Clemson University': 'clemson.edu',
  'University of California, Santa Cruz': 'ucsc.edu',
  'University of California, Riverside': 'ucr.edu',
  'Loyola Marymount University': 'lmu.edu',
  'Stony Brook University': 'stonybrook.edu',
  'Indiana University Bloomington': 'indiana.edu',
  'American University': 'american.edu',
  'University of Massachusetts Amherst': 'umass.edu',
  'Syracuse University': 'syracuse.edu',
  'Gonzaga University': 'gonzaga.edu',
  'Marquette University': 'marquette.edu',
  'Baylor University': 'baylor.edu',
  'Howard University': 'howard.edu',
  'University of California, Merced': 'ucmerced.edu',
  'Drexel University': 'drexel.edu',
  'Auburn University': 'auburn.edu',
  'University of Tennessee, Knoxville': 'utk.edu',
  'Temple University': 'temple.edu',
  'Rochester Institute of Technology': 'rit.edu',
  'Creighton University': 'creighton.edu',
  'Colorado School of Mines': 'mines.edu',
  'Williams College': 'williams.edu',
  'Amherst College': 'amherst.edu',
  'Swarthmore College': 'swarthmore.edu',
  'Pomona College': 'pomona.edu',
  'Wellesley College': 'wellesley.edu',
  'Bowdoin College': 'bowdoin.edu',
  'Claremont McKenna College': 'cmc.edu',
  'Middlebury College': 'middlebury.edu',
  'Carleton College': 'carleton.edu',
  'Haverford College': 'haverford.edu',
  'Colby College': 'colby.edu',
  'Hamilton College': 'hamilton.edu',
  'Davidson College': 'davidson.edu',
  'Grinnell College': 'grinnell.edu',
  'Colgate University': 'colgate.edu',
  'Macalester College': 'macalester.edu',
  'Babson College': 'babson.edu',
  'Spelman College': 'spelman.edu',
  'Morehouse College': 'morehouse.edu',
  'Bucknell University': 'bucknell.edu',
  'Oberlin College': 'oberlin.edu',
  'Bates College': 'bates.edu',
  'Barnard College': 'barnard.edu',
  'University of Richmond': 'richmond.edu',
  'College of the Holy Cross': 'holycross.edu',
  'Denison University': 'denison.edu',
  'Kenyon College': 'kenyon.edu',
  'University of Vermont': 'uvm.edu',
  'Union College': 'union.edu',
  'Skidmore College': 'skidmore.edu',
  'Reed College': 'reed.edu',
  'Whitman College': 'whitman.edu',
  'Lafayette College': 'lafayette.edu',
  'Smith College': 'smith.edu',
  'Bryn Mawr College': 'brynmawr.edu',
  'Vassar College': 'vassar.edu',
  'University of Puget Sound': 'pugetsound.edu',
  'Furman University': 'furman.edu',
  'Elon University': 'elon.edu',
  'University of South Florida': 'usf.edu',
  'Illinois Institute of Technology': 'iit.edu',
  'Pratt Institute': 'pratt.edu',
  'Gettysburg College': 'gettysburg.edu',
  'DePauw University': 'depauw.edu',
  'University of Arizona': 'arizona.edu',
  'University of Utah': 'utah.edu',
  'University of New Hampshire': 'unh.edu',
  'Sewanee: University of the South': 'sewanee.edu',
  'Hobart and William Smith Colleges': 'hws.edu',
  'Dickinson College': 'dickinson.edu',
  'St. Olaf College': 'stolaf.edu',
  'Wheaton College': 'wheaton.edu',
  'Belmont University': 'belmont.edu',
  'George Mason University': 'gmu.edu',
  'Providence College': 'providence.edu',
  'Muhlenberg College': 'muhlenberg.edu',
  'Oregon State University': 'oregonstate.edu',
  'Fairfield University': 'fairfield.edu',
  'Chapman University': 'chapman.edu',
  'University of Central Florida': 'ucf.edu',
  'Hendrix College': 'hendrix.edu',
  'Agnes Scott College': 'agnesscott.edu',
  'Bentley University': 'bentley.edu',
  'Ithaca College': 'ithaca.edu',
  'Xavier University': 'xavier.edu',
  'University of Hawaii at Manoa': 'hawaii.edu',
  'College of Charleston': 'cofc.edu',
  'Washington State University': 'wsu.edu',
  'Drake University': 'drake.edu',
  'James Madison University': 'jmu.edu',
  'Allegheny College': 'allegheny.edu',
  'University of Idaho': 'uidaho.edu',
  'Wofford College': 'wofford.edu',
  'California Polytechnic State University': 'calpoly.edu',
  'Quinnipiac University': 'qu.edu',
  'Rollins College': 'rollins.edu',
  'West Virginia University': 'wvu.edu',
  'Marist College': 'marist.edu',
  'Wabash College': 'wabash.edu',
  'Butler University': 'butler.edu',
  'Willamette University': 'willamette.edu',
  'Fisk University': 'fisk.edu',
  'Hofstra University': 'hofstra.edu',
  'Centre College': 'centre.edu',
  'DePaul University': 'depaul.edu',
  'Clarkson University': 'clarkson.edu',
  'Samford University': 'samford.edu',
  'Knox College': 'knox.edu',
  'Ursinus College': 'ursinus.edu',
  'Earlham College': 'earlham.edu',
  'Rhodes College': 'rhodes.edu',
  'Augustana College': 'augustana.edu',
  'Hope College': 'hope.edu',
  'Winthrop University': 'winthrop.edu',
  'Radford University': 'radford.edu',
  'Longwood University': 'longwood.edu',
  'Rider University': 'rider.edu',
  'Monmouth University': 'monmouth.edu',
  'Siena College': 'siena.edu',
  'Manhattan College': 'manhattan.edu',
  'Niagara University': 'niagara.edu',
  'Canisius University': 'canisius.edu',
  'Hamline University': 'hamline.edu',
  'Wartburg College': 'wartburg.edu',
  'Luther College': 'luther.edu',
  'Coe College': 'coe.edu',
  'Hanover College': 'hanover.edu',
  'Bellarmine University': 'bellarmine.edu',
  'Wittenberg University': 'wittenberg.edu',
  'Rockhurst University': 'rockhurst.edu',
  'Beloit College': 'beloit.edu',
  'Ripon College': 'ripon.edu',
  'Bradley University': 'bradley.edu',
  'Millsaps College': 'millsaps.edu',
  'Stetson University': 'stetson.edu',
  'Lynn University': 'lynn.edu',
  'Harding University': 'harding.edu',
  'Cedarville University': 'cedarville.edu',
  'Asbury University': 'asbury.edu',
  'Lander University': 'lander.edu',
  'Langston University': 'langston.edu',
  'Concord University': 'concord.edu',
  'Tabor College': 'tabor.edu',
  'Martin University': 'martin.edu',
  'Granite State College': 'granite.edu',
  'Wiley University': 'wileyc.edu',
  'Stillman College': 'stillman.edu',
  'West Liberty University': 'westliberty.edu',
  'Rust College': 'rustcollege.edu',
  'Brescia University': 'brescia.edu',
  'Tougaloo College': 'tougaloo.edu',
  'Warner Pacific University': 'warnerpacific.edu',
  'Presentation College': 'presentation.edu',
  'Benedictine College': 'benedictine.edu',
  'Talladega College': 'talladega.edu',
  'Claflin University': 'claflin.edu',
  'Hastings College': 'hastings.edu',
  'Lane College': 'lanecollege.edu',
  'Midland University': 'midlandu.edu',
  'Ohio Valley University': 'ovu.edu',
  'Paine College': 'paine.edu',
  'Mount Marty University': 'mountmarty.edu',
  'Morris College': 'morris.edu',
  'Voorhees University': 'voorhees.edu',
  'Livingstone College': 'livingstone.edu',
  'Bennett College': 'bennett.edu',
  'Bacone College': 'bacone.edu',
  'Oakwood University': 'oakwood.edu',
  'Texas College': 'texascollege.edu',
  'Selma University': 'selmauniversity.edu',
  'Sterling College': 'sterling.edu',
  'University of Jamestown': 'uj.edu',
  'Barton College': 'barton.edu',
  'Eureka College': 'eureka.edu',
  'Allen University': 'allenuniversity.edu',
  'Christendom College': 'christendom.edu',
  'Belhaven University': 'belhaven.edu',
  'Milligan University': 'milligan.edu',
  'Johnson University': 'johnsonu.edu',
  'Ecclesia College': 'ecollege.edu',
  'Clarke University': 'clarke.edu',
  'Baker University': 'bakeru.edu',
  'Doane University': 'doane.edu',
  'York College': 'york.edu',
  'Cottey College': 'cottey.edu',
  'Avila University': 'avila.edu',
  'Lyon College': 'lyon.edu',
  'Warner University': 'warner.edu',
  'Webber International University': 'webber.edu',
  'Keystone College': 'keystone.edu',
  'Thiel College': 'thiel.edu',
  'Waynesburg University': 'waynesburg.edu',
  'Wilson College': 'wilson.edu',
  'Rosemont College': 'rosemont.edu',
  'Thomas University': 'thomasu.edu',
  'Ferrum College': 'ferrum.edu',
  'Bluefield University': 'bluefield.edu',
  'Southern Virginia University': 'svu.edu',
  'Bridgewater College': 'bridgewater.edu',
  'Donnelly College': 'donnelly.edu',
  'Calvary University': 'calvary.edu',
  'Martin Luther College': 'mlc-wels.edu',
  'Crown College': 'crown.edu',
  'Heritage University': 'heritage.edu',
  'Corban University': 'corban.edu',
  'Northwest University': 'northwestu.edu',
  'University of Wisconsin-Richland': 'uwc.edu',
  'Saint Joseph\'s University': 'sju.edu',
  'College of Saint Benedict / Saint John\'s University': 'csbsju.edu',
  'Saint Martin\'s University': 'stmartin.edu',
  'St. Augustine\'s University': 'st-aug.edu',
  'Saint Paul\'s College': 'saintpauls.edu',
}

function getCollegeDomain(college) {
  if (DOMAIN_OVERRIDES[college.name]) return DOMAIN_OVERRIDES[college.name]
  // Try to derive from name: "Foo University" → "foo.edu"
  const name = college.name.toLowerCase()
    .replace(/^the /, '')
    .replace(/university of /i, '')
    .replace(/ university$/i, '')
    .replace(/ college$/i, '')
    .replace(/ institute$/i, '')
    .replace(/ at .*$/, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .split(/\s+/)
  if (name.length === 1) return `${name[0]}.edu`
  // Use alias if it's short
  const alias = (college.alias || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (alias.length >= 2 && alias.length <= 12) return `${alias}.edu`
  return `${name[0]}.edu`
}

function CollegeLogo({ college, size = 36 }) {
  const [srcIndex, setSrcIndex] = useState(0)
  const domain = getCollegeDomain(college)
  const initials = (college.alias || college.name).split(/[\s&]+/).filter(w => w.length > 1).slice(0, 2).map(w => w[0].toUpperCase()).join('')

  // Cascade: Google (fast CDN) → apple-touch-icon (180px+) → icon.horse → DDG
  // Google returns a valid 16x16 globe PNG even for 404s, so we must detect and skip it
  const sources = [
    `https://www.google.com/s2/favicons?domain=www.${domain}&sz=256`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    `https://${domain}/apple-touch-icon.png`,
    `https://icon.horse/icon/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ]

  const handleLoad = (e) => {
    const img = e.target
    // Google returns a 16x16 generic globe for unknown schools (even on 404).
    // Skip it from Google sources (0,1) so cascade reaches better sources.
    if (srcIndex <= 1 && img.naturalWidth <= 16) {
      setSrcIndex(i => i + 1)
      return
    }
    // Skip 1x1 empty placeholders from any source
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      setSrcIndex(i => i + 1)
    }
  }

  if (srcIndex >= sources.length) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 10, flexShrink: 0,
        background: '#0284c7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600,
        fontSize: size * 0.35, letterSpacing: '-0.02em',
      }}>
        {initials}
      </div>
    )
  }

  return (
    <img
      src={sources[srcIndex]}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
      onError={() => setSrcIndex(i => i + 1)}
      style={{
        width: size, height: size, borderRadius: 10, flexShrink: 0,
        objectFit: 'contain', background: '#fff',
      }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function CollegeRecruiting() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const requestedExam = new URLSearchParams(location.search).get('exam')
  const exam = requestedExam === 'sat' ? requestedExam : getInitialPreferredExam(user)

  /* ── State ── */
  const [attempts, setAttempts] = useState([])
  const [scoreMode, setScoreMode] = useState('superscore') // superscore | highest | custom
  const [customScore, setCustomScore] = useState('')
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState('rank')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Filters
  const [typeFilter, setTypeFilter] = useState([])         // ['public','private']
  const [costFilter, setCostFilter] = useState([])          // indices into COST_PRESETS
  const [regionFilter, setRegionFilter] = useState([])
  const [stateFilter, setStateFilter] = useState([])
  const [sizeFilter, setSizeFilter] = useState([])
  const [settingFilter, setSettingFilter] = useState([])
  const [tagFilter, setTagFilter] = useState([])
  const [tierFilter, setTierFilter] = useState([])          // ['Safety','Target','Reach','Long Reach']
  const [majorFilter, setMajorFilter] = useState('')         // single major string
  const [selectedCollege, setSelectedCollege] = useState(null) // college object for detail modal

  const scoreMin = 400
  const scoreMax = 1600

  /* ── Fetch attempts ── */
  useEffect(() => {
    if (!user?.id) return
    supabase.from('test_attempts').select('*').eq('user_id', user.id)
      .then(({ data }) => { setAttempts(data || []) })
  }, [user?.id])

  /* ── Compute scores from attempts ── */
  const { superscore, highestScore } = useMemo(() => {
    const examTests = getTestsForExam(exam)
    const examTestIds = new Set(examTests.map(t => t.id))
    const examAttempts = attempts.filter(a => examTestIds.has(normalizeTestId(a?.test_id)))
    const completed = examAttempts.filter(a => a.completed_at || a.scores?.total)
    const completedWithScores = completed
      .map(attempt => ({
        attempt,
        scores: attempt.scores?.total ? attempt.scores : (computeScoresFromAnswers(attempt) || attempt.scores || {}),
      }))
      .filter(entry => entry.scores?.total)

    // Superscore
    let ss = null
    if (completedWithScores.length) {
      let bestRW = 0, bestMath = 0
      for (const { scores } of completedWithScores) {
        bestRW = Math.max(bestRW, Number(scores.rw || 0))
        bestMath = Math.max(bestMath, Number(scores.math || 0))
      }
      if (bestRW || bestMath) ss = bestRW + bestMath
    }

    // Highest single-test score
    let hs = null
    for (const { scores } of completedWithScores) {
      const total = Number(scores.total || scores.composite || 0)
      if (total > (hs || 0)) hs = total
    }

    return { superscore: ss, highestScore: hs }
  }, [attempts, exam])

  /* ── Active score ── */
  const activeScore = useMemo(() => {
    if (scoreMode === 'custom') {
      const v = Number(customScore)
      if (!v || v < scoreMin || v > scoreMax) return null
      return v
    }
    if (scoreMode === 'highest') return highestScore
    return superscore
  }, [scoreMode, customScore, superscore, highestScore, scoreMin, scoreMax])

  /* ── Filtered & sorted colleges ── */
  const filteredColleges = useMemo(() => {
    const q = search.toLowerCase().trim()

    let list = COLLEGES_RANKED.map(college => {
      const chance = activeScore ? computeAdmissionChance(activeScore, college, exam) : null
      const tier = chance !== null ? getMatchTier(chance) : null
      return { ...college, chance, tier }
    })

    // Search
    if (q) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.alias && c.alias.toLowerCase().includes(q)) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase() === q ||
        (STATE_NAMES[c.state] || '').toLowerCase().includes(q)
      )
    }

    // Type
    if (typeFilter.length) list = list.filter(c => typeFilter.includes(c.type))

    // Cost
    if (costFilter.length) {
      list = list.filter(c => {
        return costFilter.some(idx => {
          const preset = COST_PRESETS[idx]
          const cost = c.costOut
          if (preset.min != null && cost < preset.min) return false
          if (preset.max != null && cost >= preset.max) return false
          return true
        })
      })
    }

    // Region
    if (regionFilter.length) list = list.filter(c => regionFilter.includes(c.region))

    // State
    if (stateFilter.length) list = list.filter(c => stateFilter.includes(c.state))

    // Size
    if (sizeFilter.length) list = list.filter(c => sizeFilter.includes(c.size))

    // Setting
    if (settingFilter.length) list = list.filter(c => settingFilter.includes(c.setting))

    // Tags
    if (tagFilter.length) list = list.filter(c => tagFilter.some(t => c.tags.includes(t)))

    // Match tier
    if (tierFilter.length) list = list.filter(c => c.tier && tierFilter.includes(c.tier.label))

    // Major
    if (majorFilter) list = list.filter(c => getMajorsForCollege(c).includes(majorFilter))

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'chance':
          return (b.chance || 0) - (a.chance || 0)
        case 'chance-reverse':
          return (a.chance || 0) - (b.chance || 0)
        case 'cost':
          return a.costOut - b.costOut
        case 'cost-reverse':
          return b.costOut - a.costOut
        case 'acceptance':
          return b.acceptance - a.acceptance
        case 'acceptance-reverse':
          return a.acceptance - b.acceptance
        case 'enrollment':
          return b.enrollment - a.enrollment
        case 'enrollment-reverse':
          return a.enrollment - b.enrollment
        case 'sat':
          return (b.sat75 || 0) - (a.sat75 || 0)
        case 'sat-reverse':
          return (a.sat75 || 0) - (b.sat75 || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'name-reverse':
          return b.name.localeCompare(a.name)
        case 'rank-reverse': {
          const tra = RANK_TIER_ORDER[a.rankTier] || 99
          const trb = RANK_TIER_ORDER[b.rankTier] || 99
          if (tra !== trb) return trb - tra
          return b.rank - a.rank
        }
        case 'rank':
        default: {
          const ta = RANK_TIER_ORDER[a.rankTier] || 99
          const tb = RANK_TIER_ORDER[b.rankTier] || 99
          if (ta !== tb) return ta - tb
          return a.rank - b.rank
        }
      }
    })

    return list
  }, [search, activeScore, exam, typeFilter, costFilter, regionFilter, stateFilter, sizeFilter, settingFilter, tagFilter, tierFilter, majorFilter, sortBy])

  const displayedColleges = filteredColleges.slice(0, visibleCount)
  const hasMore = visibleCount < filteredColleges.length

  /* ── Filter helpers ── */
  function toggle(arr, setter, val) {
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
    setVisibleCount(PAGE_SIZE)
  }

  function clearAllFilters() {
    setTypeFilter([])
    setCostFilter([])
    setRegionFilter([])
    setStateFilter([])
    setSizeFilter([])
    setSettingFilter([])
    setTagFilter([])
    setTierFilter([])
    setMajorFilter('')
    setSearch('')
  }

  const activeFilterCount = typeFilter.length + costFilter.length + regionFilter.length +
    stateFilter.length + sizeFilter.length + settingFilter.length + tagFilter.length + tierFilter.length + (majorFilter ? 1 : 0)

  /* ═══════════════════════════════════════════════════════════ */
  /* ── Render ── */
  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />

      <div className="page fade-up">
        {/* ── Hero ── */}
        <div style={{
          background: '#16181d',
          borderRadius: 12,
          padding: '48px 40px 40px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(2,132,199,.15), transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: '30%',
            width: 300, height: 150, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(2,132,199,.1), transparent 70%)',
          }} />
          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 32,
            fontWeight: 600,
            color: 'white',
            margin: 0,
            position: 'relative',
          }}>
            <Icon name="star" size={28} style={{ marginRight: 10, verticalAlign: 'middle', opacity: 0.8 }} />
            College Recruiting
          </h1>
          <p style={{
            color: '#8a8f98',
            fontSize: 15,
            marginTop: 8,
            position: 'relative',
            maxWidth: 600,
            lineHeight: 1.6,
          }}>
            See how you compare against colleges based strictly on your SAT test score.
            Our algorithm only factors in test scores — since most schools also consider GPA, extracurriculars,
            essays, and other factors, your actual admission chances may be higher or lower than shown.
          </p>
        </div>

        {/* ── Score Selector ── */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 14, color: '#16181d' }}>
              Your Score
            </span>
            <span style={{ fontSize: 12, color: '#565a63' }}>
              (SAT — used to estimate admission chances)
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { key: 'superscore', label: 'Superscore', value: superscore },
              { key: 'highest', label: 'Highest Score', value: highestScore },
              { key: 'custom', label: 'Custom Score', value: null },
            ].map(opt => {
              const active = scoreMode === opt.key
              return (
                <motion.button
                  key={opt.key}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setScoreMode(opt.key)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    border: active ? '2px solid #0284c7' : '1.5px solid #e4e0d5',
                    background: active ? '#faf9f6' : 'white',
                    color: active ? '#0284c7' : '#3f434b',
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: 'Fraunces, Georgia, serif',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all .2s',
                  }}
                >
                  {opt.label}
                  {opt.value != null && (
                    <span style={{
                      background: active ? '#0284c7' : '#e4e0d5',
                      color: active ? 'white' : '#3f434b',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {opt.value}
                    </span>
                  )}
                </motion.button>
              )
            })}

            {scoreMode === 'custom' && (
              <input
                type="number"
                min={scoreMin}
                max={scoreMax}
                placeholder={`${scoreMin}–${scoreMax}`}
                value={customScore}
                onChange={e => setCustomScore(e.target.value)}
                style={{
                  width: 120,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #e4e0d5',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Fraunces, Georgia, serif',
                  color: '#16181d',
                  outline: 'none',
                }}
              />
            )}

            {activeScore && (
              <div style={{
                marginLeft: 8,
                padding: '8px 16px',
                borderRadius: 10,
                background: '#0284c7',
                color: 'white',
                fontWeight: 600,
                fontSize: 16,
                fontFamily: 'Fraunces, Georgia, serif',
                boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              }}>
                {activeScore}
              </div>
            )}

            {!activeScore && (
              <span style={{ fontSize: 12, color: '#8a8f98', marginLeft: 8 }}>
                {scoreMode === 'custom'
                  ? `Enter a score between ${scoreMin} and ${scoreMax}`
                  : 'Complete a practice test to see your score'}
              </span>
            )}
          </div>
        </div>

        {/* ── Search + Sort bar ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Icon name="search" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a8f98' }} />
            <input
              type="text"
              placeholder="Search colleges by name or alias..."
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE) }}
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                borderRadius: 12,
                border: '1.5px solid #e4e0d5',
                fontSize: 14,
                color: '#16181d',
                outline: 'none',
                background: 'white',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              border: '1.5px solid #e4e0d5',
              fontSize: 13,
              fontWeight: 600,
              color: '#3f434b',
              background: 'white',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="rank">Sort: Rank (Best First)</option>
            <option value="rank-reverse">Sort: Rank (Lowest First)</option>
            <option value="chance">Sort: Admission Chance (High → Low)</option>
            <option value="chance-reverse">Sort: Admission Chance (Low → High)</option>
            <option value="cost">Sort: Cost (Low → High)</option>
            <option value="cost-reverse">Sort: Cost (High → Low)</option>
            <option value="acceptance">Sort: Acceptance Rate (High → Low)</option>
            <option value="acceptance-reverse">Sort: Acceptance Rate (Low → High)</option>
            <option value="enrollment">Sort: Enrollment (Large → Small)</option>
            <option value="enrollment-reverse">Sort: Enrollment (Small → Large)</option>
            <option value="sat">Sort: SAT Score (High → Low)</option>
            <option value="sat-reverse">Sort: SAT Score (Low → High)</option>
            <option value="name">Sort: Name (A → Z)</option>
            <option value="name-reverse">Sort: Name (Z → A)</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: filtersOpen ? '2px solid #0284c7' : '1.5px solid #e4e0d5',
              background: filtersOpen ? 'rgba(2,132,199,.06)' : 'white',
              color: filtersOpen ? '#0284c7' : '#3f434b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="settings" size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: '#0284c7',
                color: 'white',
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
              }}>
                {activeFilterCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* ── Filters Panel ── */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card"
            style={{ padding: '20px 24px', marginBottom: 20, overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 14, color: '#16181d' }}>
                Filters
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid #fca5a5',
                    background: 'rgba(239,68,68,.06)',
                    color: '#ef4444',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {/* Type */}
              <FilterGroup label="Type">
                {['public', 'private'].map(t => (
                  <FilterCheckbox key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} checked={typeFilter.includes(t)} onChange={() => toggle(typeFilter, setTypeFilter, t)} />
                ))}
              </FilterGroup>

              {/* Cost */}
              <FilterGroup label="Cost (Out-of-State)">
                {COST_PRESETS.map((p, i) => (
                  <FilterCheckbox key={i} label={p.label} checked={costFilter.includes(i)} onChange={() => toggle(costFilter, setCostFilter, i)} />
                ))}
              </FilterGroup>

              {/* Region */}
              <FilterGroup label="Region">
                {REGIONS.map(r => (
                  <FilterCheckbox key={r} label={REGION_LABELS[r]} checked={regionFilter.includes(r)} onChange={() => toggle(regionFilter, setRegionFilter, r)} />
                ))}
              </FilterGroup>

              {/* Size */}
              <FilterGroup label="Size">
                {Object.entries(SIZE_LABELS).map(([k, v]) => (
                  <FilterCheckbox key={k} label={v} checked={sizeFilter.includes(k)} onChange={() => toggle(sizeFilter, setSizeFilter, k)} />
                ))}
              </FilterGroup>

              {/* Setting */}
              <FilterGroup label="Setting">
                {SETTINGS.map(s => (
                  <FilterCheckbox key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} checked={settingFilter.includes(s)} onChange={() => toggle(settingFilter, setSettingFilter, s)} />
                ))}
              </FilterGroup>

              {/* Match Tier */}
              <FilterGroup label="Match Tier">
                {['Safety', 'Target', 'Reach', 'Long Reach'].map(t => {
                  const tier = getMatchTier(t === 'Safety' ? 80 : t === 'Target' ? 50 : t === 'Reach' ? 30 : 10)
                  return (
                    <FilterCheckbox key={t} label={t} checked={tierFilter.includes(t)} onChange={() => toggle(tierFilter, setTierFilter, t)} color={tier.color} />
                  )
                })}
              </FilterGroup>

              {/* Major */}
              <div style={{ gridColumn: 'span 2' }}>
                <FilterGroup label="Major">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={majorFilter}
                      onChange={e => { setMajorFilter(e.target.value); setVisibleCount(PAGE_SIZE) }}
                      style={{
                        flex: 1,
                        minWidth: 200,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #e4e0d5',
                        fontSize: 13,
                        color: majorFilter ? '#16181d' : '#8a8f98',
                        fontWeight: majorFilter ? 700 : 400,
                        background: 'white',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="">All Majors</option>
                      {MAJORS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {majorFilter && (
                      <button
                        onClick={() => setMajorFilter('')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid #fca5a5',
                          background: 'rgba(239,68,68,.06)',
                          color: '#ef4444',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </FilterGroup>
              </div>

              {/* Tags */}
              <div style={{ gridColumn: 'span 2' }}>
                <FilterGroup label="Tags">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {ALL_TAGS.map(t => (
                      <FilterCheckbox key={t} label={TAG_LABELS[t]} checked={tagFilter.includes(t)} onChange={() => toggle(tagFilter, setTagFilter, t)} pill />
                    ))}
                  </div>
                </FilterGroup>
              </div>

              {/* State */}
              <div style={{ gridColumn: 'span 2' }}>
                <FilterGroup label="State">
                  <select
                    multiple
                    value={stateFilter}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, o => o.value)
                      setStateFilter(selected)
                      setVisibleCount(PAGE_SIZE)
                    }}
                    style={{
                      width: '100%',
                      minHeight: 80,
                      maxHeight: 140,
                      borderRadius: 10,
                      border: '1.5px solid #e4e0d5',
                      padding: 6,
                      fontSize: 12,
                      color: '#3f434b',
                      outline: 'none',
                    }}
                  >
                    {STATES.map(s => (
                      <option key={s} value={s}>{STATE_NAMES[s] || s} ({s})</option>
                    ))}
                  </select>
                  {stateFilter.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {stateFilter.map(s => (
                        <span key={s} onClick={() => setStateFilter(prev => prev.filter(x => x !== s))} style={{
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: 'rgba(2,132,199,.1)',
                          color: '#0284c7',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}>
                          {s} &times;
                        </span>
                      ))}
                    </div>
                  )}
                </FilterGroup>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Results count ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: '#565a63', fontWeight: 600 }}>
            {filteredColleges.length} college{filteredColleges.length !== 1 ? 's' : ''} found
          </span>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} style={{
              fontSize: 12, color: '#8a8f98', background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}>
              Reset filters
            </button>
          )}
        </div>

        {/* ── College Grid ── */}
        {displayedColleges.length === 0 ? (
          <div className="card" style={{
            padding: '60px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>
              <Icon name="search" size={48} />
            </div>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 18, color: '#16181d', margin: '0 0 8px' }}>
              No colleges match{search.trim() ? ` "${search.trim()}"` : ' your filters'}
            </h3>
            <p style={{ color: '#565a63', fontSize: 14, margin: 0 }}>
              {search.trim() && activeFilterCount > 0
                ? `You have ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active that may be hiding results. Try clearing filters.`
                : 'Try adjusting your search or filters to see more results.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
              {search.trim() && activeFilterCount > 0 && (
                <button
                  onClick={() => { setTypeFilter([]); setCostFilter([]); setRegionFilter([]); setStateFilter([]); setSizeFilter([]); setSettingFilter([]); setTagFilter([]); setTierFilter([]); setMajorFilter(''); setVisibleCount(PAGE_SIZE) }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#0284c7',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Clear Filters (Keep Search)
                </button>
              )}
              <button
                onClick={clearAllFilters}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: search.trim() && activeFilterCount > 0 ? '1.5px solid #e4e0d5' : 'none',
                  background: search.trim() && activeFilterCount > 0 ? 'white' : '#0284c7',
                  color: search.trim() && activeFilterCount > 0 ? '#3f434b' : 'white',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Clear Everything
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
            gap: 16,
          }}>
            {displayedColleges.map((college, i) => (
              <CollegeCard key={college.name} college={college} exam={exam} index={i} onClick={() => setSelectedCollege(college)} />
            ))}
          </div>
        )}

        {/* ── Show More ── */}
        {hasMore && (
          <div style={{ textAlign: 'center', padding: '28px 0 16px' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
              style={{
                padding: '12px 32px',
                borderRadius: 12,
                border: '1.5px solid #e4e0d5',
                background: 'white',
                color: '#3f434b',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Show More ({filteredColleges.length - visibleCount} remaining)
            </motion.button>
          </div>
        )}

        {/* Bottom spacer */}
        <div style={{ height: 40 }} />
      </div>

      {/* ── College Detail Modal — rendered outside .page to avoid overflow:clip ── */}
      {selectedCollege && (
        <CollegeDetailModal
          college={selectedCollege}
          exam={exam}
          activeScore={activeScore}
          onClose={() => setSelectedCollege(null)}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/* ── Sub-components ── */
/* ═══════════════════════════════════════════════════════════ */

function FilterGroup({ label, children }) {
  return (
    <div>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#565a63',
        marginBottom: 8,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function FilterCheckbox({ label, checked, onChange, color, pill }) {
  if (pill) {
    return (
      <button
        onClick={onChange}
        style={{
          padding: '5px 12px',
          borderRadius: 8,
          border: checked ? '1.5px solid #0284c7' : '1.5px solid #e4e0d5',
          background: checked ? 'rgba(2,132,199,.08)' : 'white',
          color: checked ? '#0284c7' : '#565a63',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all .15s',
        }}
      >
        {label}
      </button>
    )
  }
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontSize: 13,
      color: '#3f434b',
      padding: '3px 0',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ accentColor: color || '#0284c7', width: 15, height: 15 }}
      />
      <span style={{ fontWeight: checked ? 700 : 500, color: checked ? (color || '#16181d') : '#565a63' }}>
        {label}
      </span>
    </label>
  )
}

function CollegeCard({ college, exam, index, onClick }) {
  const low = college.sat25
  const high = college.sat75
  const tier = college.tier
  const chance = college.chance

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.3 }}
      className="card"
      onClick={onClick}
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow .2s ease, transform .2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(22,24,29,.06)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
    >
      {/* Tier stripe */}
      {tier && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: tier.color,
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
          <CollegeLogo college={college} size={40} />
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontWeight: 600,
              fontSize: 15,
              color: '#16181d',
              margin: 0,
              lineHeight: 1.3,
            }}>
              {college.name}
            </h3>
            {college.alias !== college.name && (
              <div style={{ fontSize: 12, color: '#8a8f98', marginTop: 2 }}>{college.alias}</div>
            )}
            <div style={{ fontSize: 12, color: '#565a63', marginTop: 4 }}>
              {college.city}, {STATE_NAMES[college.state] || college.state}
            </div>
          </div>
        </div>

        {/* Tier badge + chance */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {tier && (
            <div style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: 8,
              background: tier.bg,
              color: tier.color,
              fontSize: 11,
              fontWeight: 600,
              border: `1px solid ${tier.color}22`,
            }}>
              {tier.label}
            </div>
          )}
          {chance !== null && (
            <div style={{
              fontSize: 22,
              fontWeight: 600,
              fontFamily: 'Fraunces, Georgia, serif',
              color: tier?.color || '#3f434b',
              marginTop: 4,
            }}>
              {chance}%
            </div>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Badge
          label={college.type === 'public' ? 'Public' : 'Private'}
          color={college.type === 'public' ? '#059669' : '#7c3aed'}
          bg={college.type === 'public' ? 'rgba(5,150,105,.08)' : 'rgba(124,58,237,.08)'}
        />
        <Badge
          label={`${formatEnrollment(college.enrollment)} students`}
          color="#565a63"
          bg="rgba(86,90,99,.08)"
        />
        <Badge
          label={college.size === 'small' ? 'Small' : college.size === 'medium' ? 'Medium' : 'Large'}
          color="#3f434b"
          bg="rgba(63,67,75,.08)"
        />
        <Badge
          label={`${(college.acceptance * 100).toFixed(college.acceptance < 0.1 ? 1 : 0)}% acceptance`}
          color="#0284c7"
          bg="rgba(2,132,199,.08)"
        />
        <Badge
          label={`#${college.rank}`}
          color="#f59e0b"
          bg="rgba(245,158,11,.08)"
        />
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        padding: '10px 0 0',
        borderTop: '1px solid #f3f0e9',
      }}>
        <StatCell label="In-State" value={formatCost(college.costIn)} />
        <StatCell label="Out-of-State" value={formatCost(college.costOut)} />
        <StatCell label="SAT 25th" value={low || '—'} />
        <StatCell label="SAT 75th" value={high || '—'} />
      </div>

      {/* Tags */}
      {college.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          {college.tags.map(tag => (
            <span key={tag} style={{
              padding: '2px 8px',
              borderRadius: 6,
              background: '#f3f0e9',
              color: '#565a63',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'capitalize',
            }}>
              {TAG_LABELS[tag] || tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 6,
      background: bg,
      color: color,
      fontSize: 11,
      fontWeight: 700,
    }}>
      {label}
    </span>
  )
}

function StatCell({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#8a8f98', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#16181d', fontFamily: 'Fraunces, Georgia, serif' }}>
        {value}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/* ── College Detail Modal ── */
/* ═══════════════════════════════════════════════════════════ */
function CollegeDetailModal({ college, exam, activeScore, onClose }) {
  const chance = activeScore ? computeAdmissionChance(activeScore, college, exam) : null
  const tier = chance !== null ? getMatchTier(chance) : null
  const majors = getMajorsForCollege(college)
  const domain = getCollegeDomain(college)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent background scroll — target the .page scroll container, not body
  useEffect(() => {
    const page = document.querySelector('.app-layout .page')
    if (page) { page.style.overflow = 'hidden' }
    document.body.style.overflow = 'hidden'
    return () => {
      if (page) { page.style.overflow = '' }
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(22,24,29,.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 12, width: '100%', maxWidth: 720,
          maxHeight: '90vh', overflow: 'auto', position: 'relative',
          boxShadow: '0 1px 3px rgba(22,24,29,.06)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky', top: 12, float: 'right', marginRight: 12, marginTop: 12,
            width: 36, height: 36, borderRadius: 12, border: 'none',
            background: 'rgba(0,0,0,.06)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#565a63', zIndex: 2,
          }}
        >
          &times;
        </button>

        {/* Header */}
        <div style={{
          background: '#16181d',
          padding: '32px 32px 28px', borderRadius: '12px 12px 0 0',
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <CollegeLogo college={college} size={56} />
            <div>
              <h2 style={{
                fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 24,
                color: 'white', margin: 0, lineHeight: 1.2,
              }}>
                {college.name}
              </h2>
              {college.alias !== college.name && (
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginTop: 4 }}>{college.alias}</div>
              )}
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 6 }}>
                {college.city}, {STATE_NAMES[college.state] || college.state} &middot; {college.setting.charAt(0).toUpperCase() + college.setting.slice(1)} &middot; {college.type === 'public' ? 'Public' : 'Private'}
              </div>
            </div>
          </div>

          {/* Chance banner */}
          {tier && (
            <div style={{
              marginTop: 20, display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '14px 20px',
            }}>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 600, color: tier.color }}>
                {chance}%
              </div>
              <div>
                <div style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 8,
                  background: tier.bg, color: tier.color, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${tier.color}33`, marginBottom: 4,
                }}>
                  {tier.label}
                </div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>
                  Estimated admission chance based on your SAT score of {activeScore}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '24px 32px 32px' }}>
          {/* Quick stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12, marginBottom: 24,
          }}>
            <DetailStat label="National Rank" value={`#${college.rank}`} icon="star" color="#f59e0b" />
            <DetailStat label="Acceptance Rate" value={`${(college.acceptance * 100).toFixed(college.acceptance < 0.1 ? 1 : 0)}%`} icon="target" color="#0284c7" />
            <DetailStat label="Enrollment" value={college.enrollment.toLocaleString()} icon="students" color="#8b5cf6" />
            <DetailStat label="School Size" value={college.size === 'small' ? 'Small (<5k)' : college.size === 'medium' ? 'Medium (5k-15k)' : 'Large (15k+)'} icon="info" color="#565a63" />
          </div>

          {/* Cost */}
          <DetailSection title="Cost & Tuition" icon="chart">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 16, background: '#f7f5ef', borderRadius: 12, border: '1px solid #e4e0d5' }}>
                <div style={{ fontSize: 11, color: '#565a63', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>In-State Tuition</div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#16181d' }}>
                  {college.costIn === 0 ? 'Free' : `$${college.costIn.toLocaleString()}`}
                </div>
                <div style={{ fontSize: 12, color: '#8a8f98', marginTop: 2 }}>per year</div>
              </div>
              <div style={{ padding: 16, background: '#f7f5ef', borderRadius: 12, border: '1px solid #e4e0d5' }}>
                <div style={{ fontSize: 11, color: '#565a63', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Out-of-State Tuition</div>
                <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#16181d' }}>
                  {college.costOut === 0 ? 'Free' : `$${college.costOut.toLocaleString()}`}
                </div>
                <div style={{ fontSize: 12, color: '#8a8f98', marginTop: 2 }}>per year</div>
              </div>
            </div>
          </DetailSection>

          {/* Test Scores */}
          <DetailSection title="Test Score Ranges" icon="test">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div style={{ padding: 16, background: '#f7f5ef', borderRadius: 12, border: '1px solid #e4e0d5' }}>
                <div style={{ fontSize: 11, color: '#565a63', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>SAT Range</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 600, color: '#16181d' }}>{college.sat25}</span>
                  <span style={{ color: '#8a8f98', fontSize: 13 }}>–</span>
                  <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 600, color: '#16181d' }}>{college.sat75}</span>
                </div>
                <div style={{ fontSize: 11, color: '#8a8f98', marginTop: 2 }}>25th – 75th percentile</div>
                {activeScore && (
                  <div style={{
                    marginTop: 8, fontSize: 12, fontWeight: 700,
                    color: activeScore >= college.sat75 ? '#059669' : activeScore >= college.sat25 ? '#f59e0b' : '#ef4444',
                  }}>
                    Your score: {activeScore} ({activeScore >= college.sat75 ? 'Above 75th' : activeScore >= college.sat25 ? 'In range' : 'Below 25th'})
                  </div>
                )}
              </div>
            </div>
          </DetailSection>

          {/* Location & Campus */}
          <DetailSection title="Location & Campus" icon="info">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <InfoRow label="City" value={college.city} />
              <InfoRow label="State" value={STATE_NAMES[college.state] || college.state} />
              <InfoRow label="Region" value={REGION_LABELS[college.region] || college.region} />
              <InfoRow label="Setting" value={college.setting.charAt(0).toUpperCase() + college.setting.slice(1)} />
              <InfoRow label="Type" value={college.type === 'public' ? 'Public University' : 'Private University'} />
              <InfoRow label="Undergraduate Enrollment" value={college.enrollment.toLocaleString()} />
            </div>
          </DetailSection>

          {/* Tags */}
          {college.tags.length > 0 && (
            <DetailSection title="School Features" icon="star">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {college.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '6px 14px', borderRadius: 10,
                    background: '#f3f0e9', color: '#3f434b',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {TAG_LABELS[tag] || tag}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Majors */}
          <DetailSection title={`Popular Majors (${majors.length})`} icon="guide">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {majors.map(m => (
                <span key={m} style={{
                  padding: '5px 12px', borderRadius: 8,
                  background: 'rgba(2,132,199,.06)', border: '1px solid rgba(2,132,199,.12)',
                  color: '#0284c7', fontSize: 12, fontWeight: 600,
                }}>
                  {m}
                </span>
              ))}
            </div>
          </DetailSection>

          {/* Application Requirements */}
          {college.app && (
            <DetailSection title="Application Requirements" icon="test">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
                {college.app.platform && <InfoRow label="Application Platform" value={APP_PLATFORM_LABELS[college.app.platform] || college.app.platform} />}
                {college.app.testPolicy && <InfoRow label="Test Policy" value={TEST_POLICY_LABELS[college.app.testPolicy] || college.app.testPolicy} />}
                {college.app.recLetters != null && <InfoRow label="Recommendation Letters" value={college.app.recLetters === 0 ? 'Not Required' : `${college.app.recLetters} required`} />}
                {college.app.interview && <InfoRow label="Interview" value={INTERVIEW_LABELS[college.app.interview] || college.app.interview} />}
                {college.app.essays != null && <InfoRow label="Supplemental Essays" value={college.app.essays === 0 ? 'None' : `${college.app.essays} essay${college.app.essays > 1 ? 's' : ''}`} />}
              </div>

              {/* Deadlines */}
              {(college.app.deadlineED || college.app.deadlineEA || college.app.deadlineRD) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#3f434b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Application Deadlines</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {college.app.deadlineED && (
                      <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.15)', color: '#7c3aed', fontSize: 13, fontWeight: 700 }}>
                        ED: {college.app.deadlineED}
                      </span>
                    )}
                    {college.app.deadlineED2 && (
                      <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.12)', color: '#7c3aed', fontSize: 13, fontWeight: 700 }}>
                        ED II: {college.app.deadlineED2}
                      </span>
                    )}
                    {college.app.deadlineEA && (
                      <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(2,132,199,.08)', border: '1px solid rgba(2,132,199,.15)', color: '#0284c7', fontSize: 13, fontWeight: 700 }}>
                        EA: {college.app.deadlineEA}
                      </span>
                    )}
                    {college.app.deadlineRD && (
                      <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(63,67,75,.08)', border: '1px solid rgba(63,67,75,.15)', color: '#3f434b', fontSize: 13, fontWeight: 700 }}>
                        RD: {college.app.deadlineRD}
                      </span>
                    )}
                    {college.app.rolling && (
                      <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.15)', color: '#059669', fontSize: 13, fontWeight: 700 }}>
                        Rolling Admission
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              {college.app.specialReqs && college.app.specialReqs.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#3f434b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Special Requirements</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {college.app.specialReqs.map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#3f434b', lineHeight: 1.5 }}>
                        <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 11, marginTop: 3, flexShrink: 0 }}>&#9679;</span>
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What They Look For */}
              {college.app.lookingFor && (
                <div style={{
                  padding: 16, borderRadius: 12,
                  background: '#faf9f6',
                  border: '1px solid rgba(2,132,199,.10)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>What They Look For</div>
                  <div style={{ fontSize: 13, color: '#3f434b', lineHeight: 1.7 }}>{college.app.lookingFor}</div>
                </div>
              )}
            </DetailSection>
          )}

          {/* Visit website */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 12,
                background: '#0284c7',
                color: 'white', fontWeight: 600, fontSize: 14,
                textDecoration: 'none',
                fontFamily: 'Fraunces, Georgia, serif',
                boxShadow: '0 1px 3px rgba(22,24,29,.06)',
              }}
            >
              Visit {college.alias || college.name} Website &rarr;
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function DetailSection({ title, icon, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 600, color: '#16181d',
      }}>
        <Icon name={icon} size={16} />
        {title}
      </div>
      {children}
    </div>
  )
}

function DetailStat({ label, value, icon, color }) {
  return (
    <div style={{
      padding: 14, background: '#f7f5ef', borderRadius: 12,
      border: '1px solid #e4e0d5', textAlign: 'center',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, margin: '0 auto 8px',
        background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={16} style={{ color }} />
      </div>
      <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 600, color: '#16181d' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8a8f98', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ padding: '10px 14px', background: '#f7f5ef', borderRadius: 10, border: '1px solid #e4e0d5' }}>
      <div style={{ fontSize: 10, color: '#8a8f98', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#16181d', marginTop: 2 }}>{value}</div>
    </div>
  )
}
