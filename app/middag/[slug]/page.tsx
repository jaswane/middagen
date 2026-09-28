import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock3, CookingPot } from 'lucide-react';
import meals from '@/lib/meals.json';
import { type Meal, costLabels, categoryLabels } from '@/lib/types';
import { RecipeIngredients } from '@/components/recipe-ingredients';
export const dynamicParams = false;
export function generateStaticParams() { return meals.map(m => ({ slug:m.slug })); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug} = await params; const meal = meals.find(m => m.slug===slug);
  return meal ? {title:`${meal.title} – ${meal.timeMinutes} min`, description:meal.shortDescription, alternates:{canonical:`/middag/${slug}/`}} : {title:'Retten finnes ikke'};
}
export default async function MealPage({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params; const meal = meals.find(m => m.slug===slug) as Meal | undefined;
  if(!meal) notFound();
  const schema = {'@context':'https://schema.org','@type':'Recipe',name:meal.title,description:meal.shortDescription,totalTime:`PT${meal.timeMinutes}M`,recipeYield:`${meal.baseServings} porsjoner`,recipeCategory:'Middag',recipeIngredient:meal.ingredients.map(i => `${i.quantity??''} ${i.unit} ${i.name}`.trim()),recipeInstructions:meal.instructions.map(text=>({'@type':'HowToStep',text})),...(meal.slug==='laks-med-poteter'?{image:'https://middagen-hverdag.andreas-swane.chatgpt.site/images/laks.webp'}:{})};
  return <main id="hovedinnhold" className="recipe-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><Link href="/" className="back-link"><ArrowLeft size={16}/>Tilbake til middagstips</Link><header className="recipe-heading"><p className="eyebrow">JA. DET LAGER VI.</p><h1>{meal.title}</h1><p>{meal.shortDescription}</p><div className="recipe-meta"><span><Clock3 size={16}/>Ca. {meal.timeMinutes} min</span><span><CookingPot size={16}/>{meal.difficulty==='enkel'?'Enkel':'Middels'}</span><span>{costLabels[meal.costTier]}</span><span>{categoryLabels[meal.category]}</span></div>{meal.timeNote && <p className="recipe-time-note">{meal.timeNote}</p>}</header>
  <div className="recipe-body"><RecipeIngredients ingredients={meal.ingredients} baseServings={meal.baseServings} mealId={meal.id}/><section aria-labelledby="instructions-title">{meal.slug==='laks-med-poteter'&&<figure><img className="recipe-image" src="/images/laks.webp" alt="Laks med poteter, brokkoli og sitron – illustrasjonsfoto" width="900" height="600"/><figcaption className="prototype-note">KI-laget illustrasjonsfoto.</figcaption></figure>}<h2 id="instructions-title">Slik gjør du</h2><ol className="instructions">{meal.instructions.map((step,i)=><li key={i}>{step}</li>)}</ol><aside className="recipe-tip"><strong>Et lite tips</strong>{meal.tip}</aside></section></div><div className="recipe-bottom"><p>Ikke helt det du hadde lyst på?</p><Link href="/" className="button button-secondary">Velg en annen middag<ArrowRight size={17}/></Link></div></main>;
}
