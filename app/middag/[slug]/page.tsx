import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import meals from '@/lib/meals.json';
import { type Meal, costLabels, displayTagLabels } from '@/lib/types';
import { RecipeIngredients } from '@/components/recipe-ingredients';
import { MealImage } from '@/components/meal-image';
export const dynamicParams = false;
export function generateStaticParams() { return meals.map(m => ({ slug:m.slug })); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug} = await params; const meal = meals.find(m => m.slug===slug);
  return meal ? {title:`${meal.title} – ${meal.timeMinutes} min`, description:meal.shortDescription, alternates:{canonical:`/middag/${slug}/`}} : {title:'Retten finnes ikke'};
}
export default async function MealPage({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params; const meal = meals.find(m => m.slug===slug) as Meal | undefined;
  if(!meal) notFound();
  const schema = {'@context':'https://schema.org','@type':'Recipe',name:meal.title,description:meal.shortDescription,totalTime:`PT${meal.timeMinutes}M`,recipeYield:`${meal.baseServings} porsjoner`,recipeCategory:'Middag',image:`https://middagen-hverdag.andreas-swane.chatgpt.site${meal.image.src}`,recipeIngredient:meal.ingredients.map(i => `${i.quantity??''} ${i.unit} ${i.name}`.trim()),recipeInstructions:meal.instructions.map(text=>({'@type':'HowToStep',text}))};
  return <main id="hovedinnhold" className="recipe-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><Link href="/" className="back-link"><ArrowLeft size={16}/>Tilbake til middagstips</Link>
    <header className="recipe-heading recipe-with-photo"><h1>{meal.title}</h1><figure className="recipe-figure"><MealImage image={meal.image} className="recipe-main-photo" sizes="(max-width: 760px) 140px, (max-width: 1050px) 34vw, 430px" eager/><figcaption>KI-laget illustrasjonsbilde.</figcaption></figure><p className="recipe-description">{meal.shortDescription}</p><div className="recipe-facts"><div className="recipe-meta"><span><Clock3 size={16}/>Ca. {meal.timeMinutes} min</span><span>{costLabels[meal.costTier]}</span></div>{meal.displayTags.length > 0 && <p className="display-tags">{meal.displayTags.map(tag => displayTagLabels[tag]).join(' · ')}</p>}{meal.timeNote && <p className="recipe-time-note">{meal.timeNote}</p>}<p className="recipe-equipment">Utstyr: {meal.equipmentTags.join(', ')}.</p></div></header>
    <div className="recipe-body"><RecipeIngredients ingredients={meal.ingredients} baseServings={meal.baseServings} mealSlug={meal.slug}/><section aria-labelledby="instructions-title"><h2 id="instructions-title">Slik gjør du</h2><ol className="instructions">{meal.instructions.map((step,i)=><li key={i}>{step}</li>)}</ol><aside className="recipe-tip"><strong>Et lite tips</strong>{meal.tip}</aside></section></div><div className="recipe-bottom"><p>Ikke helt det du hadde lyst på?</p><Link href="/" className="button button-secondary">Velg en annen middag<ArrowRight size={17}/></Link></div></main>;
}
