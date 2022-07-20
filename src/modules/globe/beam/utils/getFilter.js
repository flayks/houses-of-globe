/*
 * compute filtering enum, return one of the following :
 *  NEAREST
 *  LINEAR
 *  NEAREST_MIPMAP_NEAREST
 *  LINEAR_MIPMAP_NEAREST
 *  NEAREST_MIPMAP_LINEAR
 *  LINEAR_MIPMAP_LINEAR
 */
export default function getFilter( smooth, mipmap, miplinear ){
  return 0x2600 | (+smooth) | (+mipmap<<8) | ( +( mipmap && miplinear )<<1 );
}